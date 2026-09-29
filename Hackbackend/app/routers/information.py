import re
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.information import InformationCreate, InformationResponse, ProjectInformationListResponse
from app.schemas.memory import MemoryRecallResponse
from app.schemas.ai import ProjectProcessRequest, ProjectProcessResponse
from app.schemas.qa import AskRequest, AskResponse, EvidenceItem
from app.services.project_service import (
    get_project_by_id,
    create_information_metadata,
    get_information_metadata_by_project,
)
from app.services.hindsight_service import hindsight_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/projects", tags=["Project Information & Memories"])


@router.post(
    "/{project_id}/information",
    response_model=InformationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add project information and store in Hindsight long-term memory"
)
async def add_project_information(
    project_id: int,
    payload: InformationCreate,
    db: Session = Depends(get_db)
):
    """
    1. Validates that the project exists in MySQL.
    2. Generates a unique document ID reference.
    3. Persists document/information metadata in MySQL (without duplicating memory data).
    4. Indexes and stores the information into Hindsight long-term memory under `project_<project_id>`.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    # Unique reference identifier for the memory chunk in Hindsight (use user document_id if provided)
    if payload.document_id and payload.document_id.strip():
        document_id = payload.document_id.strip()
    else:
        document_id = f"doc_{project_id}_{uuid.uuid4().hex[:8]}"

    # 1. Store only metadata in MySQL
    info_record = create_information_metadata(
        db=db,
        project_id=project_id,
        title=payload.title,
        info_type=payload.info_type,
        document_id=document_id
    )

    # 2. Retain the actual long-term memory in Hindsight scoped to project bank
    # Prepend meeting / document title context to ensure rich retrieval matching
    memory_text = (
        f"Meeting / Document: {payload.title}\n{payload.content}"
        if payload.title and payload.title.lower() not in payload.content.lower()
        else payload.content
    )

    retain_res = await hindsight_service.retain_memory(
        project_id=project_id,
        content=memory_text,
        document_id=document_id,
        metadata={
            "title": payload.title,
            "info_type": payload.info_type,
            "document_id": document_id,
            "source": payload.title,
            "project_id": str(project_id)
        }
    )

    bank_id = hindsight_service.get_bank_id(project_id)
    operation_id = getattr(retain_res, "operation_id", None) if retain_res else None

    return InformationResponse(
        id=info_record.id,
        project_id=project_id,
        title=info_record.title,
        info_type=info_record.info_type,
        document_id=document_id,
        created_at=info_record.created_at,
        hindsight_retained=bool(retain_res and getattr(retain_res, "success", True)),
        hindsight_bank_id=bank_id,
        hindsight_operation_id=operation_id
    )


@router.get(
    "/{project_id}/memories",
    response_model=MemoryRecallResponse,
    status_code=status.HTTP_200_OK,
    summary="Recall project memories from Hindsight"
)
async def recall_project_memories(
    project_id: int,
    query: Optional[str] = Query(
        default="",
        description="Search query to filter recalled memories. If empty, retrieves general project memory context."
    ),
    db: Session = Depends(get_db)
):
    """
    Recalls memories from Hindsight scoped to `project_<project_id>`.
    Ensures that queries for this project NEVER return memories from another project.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    bank_id = hindsight_service.get_bank_id(project_id)
    memories = await hindsight_service.recall_memories(
        project_id=project_id,
        query=query or ""
    )

    return MemoryRecallResponse(
        project_id=project_id,
        bank_id=bank_id,
        query=query or "",
        total_memories=len(memories),
        memories=memories
    )


@router.get(
    "/{project_id}/information",
    response_model=ProjectInformationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project information metadata stored in MySQL"
)
def get_project_information_metadata(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves all information/document metadata stored in MySQL for the given project.
    Note: Raw memory content is stored in Hindsight and not duplicated here.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    records = get_information_metadata_by_project(db=db, project_id=project_id)
    return ProjectInformationListResponse(
        project_id=project_id,
        total=len(records),
        records=records
    )


@router.post(
    "/{project_id}/process",
    response_model=ProjectProcessResponse,
    status_code=status.HTTP_200_OK,
    summary="Process raw project information with Gemini AI and retain structured memory in Hindsight"
)
async def process_project_information(
    project_id: int,
    payload: ProjectProcessRequest,
    db: Session = Depends(get_db)
):
    """
    1. Validates that the project exists in MySQL (404 if not found).
    2. Sends raw content to Gemini AI extraction service.
    3. Receives structured memories (decisions, reasons, problems, changes, etc.).
    4. Converts structured memories into relational historical context text.
    5. Saves document metadata in MySQL project_information table.
    6. Retains memory into Hindsight under the project-scoped bank: `project_<project_id>`.
    7. Returns the extracted memories and storage confirmation.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    # 1. AI Extraction using Gemini
    extracted = ai_service.extract_project_memories(payload.content)

    # 2. Determine title and document ID (preserve user identity if provided)
    if payload.title and payload.title.strip():
        doc_title = payload.title.strip()
    else:
        doc_title = (
            f"AI: {extracted.decisions[0]}"
            if extracted.decisions
            else "AI Processed Project Evolution"
        )
        if len(doc_title) > 250:
            doc_title = doc_title[:247] + "..."

    if payload.document_id and payload.document_id.strip():
        document_id = payload.document_id.strip()
    else:
        document_id = f"ai_doc_{project_id}_{uuid.uuid4().hex[:8]}"

    # 3. Format into rich contextual memory text preserving relationships and meeting header
    memory_text = ai_service.format_extracted_memories_for_hindsight(
        extracted,
        raw_content=payload.content,
        title=doc_title
    )

    # 4. Save metadata in MySQL (raw memories remain exclusively in Hindsight)
    create_information_metadata(
        db=db,
        project_id=project_id,
        title=doc_title,
        info_type=payload.info_type or ("decision" if extracted.decisions else "meeting_note"),
        document_id=document_id
    )

    # 5. Store in Hindsight using the EXISTING Hindsight service and project bank
    retain_res = await hindsight_service.retain_memory(
        project_id=project_id,
        content=memory_text,
        document_id=document_id,
        metadata={
            "project_id": str(project_id),
            "source": doc_title,
            "title": doc_title,
            "document_id": document_id,
            "memory_type": "project_evolution"
        }
    )

    return ProjectProcessResponse(
        project_id=project_id,
        extracted_memories=extracted,
        stored=bool(retain_res and getattr(retain_res, "success", True))
    )


def _extract_meeting_target(question: str) -> Optional[dict]:
    """Detects if user question targets a specific meeting or document identifier."""
    q_lower = question.lower()
    m_match = re.search(r'\bmeeting[_\s\-#]*([a-zA-Z0-9_\-]+)\b', q_lower)
    if m_match:
        m_id = m_match.group(1).strip()
        if m_id not in {"notes", "note", "discussion", "discussions", "minutes", "summary"}:
            return {"type": "meeting", "id": m_id, "raw": m_match.group(0)}
    doc_match = re.search(r'\b(doc_[a-zA-Z0-9_\-]+|meeting_[a-zA-Z0-9_\-]+)\b', q_lower)
    if doc_match:
        return {"type": "document", "id": doc_match.group(1).strip(), "raw": doc_match.group(0)}
    return None


def _memory_matches_target(memory: MemoryItem, target: dict) -> bool:
    """Verifies that a recalled memory belongs to the targeted meeting/document."""
    target_id = target["id"].lower()
    target_raw = target["raw"].lower()
    meta = memory.metadata or {}
    title = str(meta.get("title", "")).lower()
    doc_id = str(memory.document_id or meta.get("document_id", "")).lower()
    text = memory.text.lower()
    combined = f"{title} {doc_id} {text}"

    if target_raw in combined:
        return True
    if target_id == doc_id or f"meeting_{target_id}" == doc_id or f"doc_{target_id}" == doc_id:
        return True

    patterns = [
        rf'\bmeeting[_\s\-#]*0*{re.escape(target_id)}\b',
        rf'\bdoc[_\s\-#]*0*{re.escape(target_id)}\b',
    ]
    for pat in patterns:
        if re.search(pat, combined):
            return True
    return False


@router.post(
    "/{project_id}/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question about project evolution and get a grounded answer with evidence"
)
async def ask_project_question(
    project_id: int,
    payload: AskRequest,
    db: Session = Depends(get_db)
):
    """
    1. Verifies that the project exists in MySQL (404 if not found).
    2. Identifies if the question targets a specific meeting/document vs cross-meeting evolution.
    3. Recalls relevant project memories from Hindsight scoped to `project_<project_id>`.
    4. If meeting-specific, strictly isolates retrieval to that meeting's memories (no cross-meeting leakage).
    5. Sends the question and isolated memories to Gemini AI reasoning service.
    6. Grounds evidence directly in actual recalled memories, preserving document_id, source, and metadata.
    7. Returns grounded answer, evidence list, and confidence rating (high, medium, low).
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    # 1. Identify meeting target
    target = _extract_meeting_target(payload.question)

    # 2. Recall relevant memories from Hindsight scoped strictly to project bank
    query_to_send = f"{payload.question} {target['raw']}" if target else payload.question
    memories = await hindsight_service.recall_memories(
        project_id=project_id,
        query=query_to_send,
        top_k=10
    )

    if target:
        # STRICT ISOLATION: Restrict context exclusively to memories matching the targeted meeting/document
        candidate_memories = [m for m in memories if _memory_matches_target(m, target)]
        if not candidate_memories:
            return AskResponse(
                project_id=project_id,
                question=payload.question,
                answer=f"The available project history does not contain information about {target['raw'].title()}.",
                evidence=[],
                confidence="low"
            )
    else:
        candidate_memories = memories

    if not candidate_memories:
        return AskResponse(
            project_id=project_id,
            question=payload.question,
            answer="The available project history does not contain enough information to answer this question.",
            evidence=[],
            confidence="low"
        )

    # 3. AI Reasoning using Gemini
    reasoning_res = ai_service.answer_historical_question(
        question=payload.question,
        memories=candidate_memories
    )

    # 4. Ground evidence strictly in actual candidate memories from Hindsight
    grounded_evidence: List[EvidenceItem] = []
    if reasoning_res.confidence != "low":
        for ev in reasoning_res.evidence:
            matched_mem = None
            for m in candidate_memories:
                if ev.memory.strip() in m.text or m.text.strip() in ev.memory:
                    matched_mem = m
                    break
            if not matched_mem and candidate_memories:
                matched_mem = candidate_memories[0]

            if matched_mem:
                meta = matched_mem.metadata or {}
                grounded_evidence.append(
                    EvidenceItem(
                        memory=matched_mem.text,
                        source=meta.get("source") or meta.get("title") or ev.source or "project memory",
                        relevance=ev.relevance or "Supporting historical evidence from project memory",
                        document_id=matched_mem.document_id or meta.get("document_id"),
                        memory_type=meta.get("memory_type") or matched_mem.type,
                        date=meta.get("date") or meta.get("created_at")
                    )
                )

    return AskResponse(
        project_id=project_id,
        question=payload.question,
        answer=reasoning_res.answer,
        evidence=grounded_evidence,
        confidence=reasoning_res.confidence
    )

