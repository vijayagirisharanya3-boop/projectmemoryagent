from typing import List, Optional
from pydantic import BaseModel, Field


class ExtractedMemories(BaseModel):
    """
    Structured extraction of project evolution facts from raw text.
    Preserves WHAT happened, WHY it happened, WHAT changed, WHAT problem caused it, and WHAT is unresolved.
    """
    decisions: List[str] = Field(default_factory=list, description="Decisions made")
    reasons: List[str] = Field(default_factory=list, description="Reasons behind decisions")
    problems: List[str] = Field(default_factory=list, description="Problems encountered")
    changes: List[str] = Field(default_factory=list, description="Changes from previous approaches")
    previous_approaches: List[str] = Field(default_factory=list, description="Previous approaches")
    failed_approaches: List[str] = Field(default_factory=list, description="Explicitly mentioned failed approaches")
    action_items: List[str] = Field(default_factory=list, description="Action items")
    deadlines: List[str] = Field(default_factory=list, description="Deadlines mentioned")
    owners: List[str] = Field(default_factory=list, description="Owners or assignees")
    unresolved_questions: List[str] = Field(default_factory=list, description="Unresolved questions or open issues")


class ProjectProcessRequest(BaseModel):
    content: str = Field(
        default="",
        min_length=0,
        description="Raw meeting, discussion, or project information to extract and store as memories"
    )
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional title or meeting identifier (e.g. Database Discussion - Meeting 1)"
    )
    document_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional explicit document ID or meeting ID (e.g. meeting_001)"
    )
    info_type: Optional[str] = Field(
        default=None,
        description="Optional information type category (e.g. meeting_note, decision)"
    )


class ProjectProcessResponse(BaseModel):
    project_id: int
    extracted_memories: ExtractedMemories
    stored: bool
