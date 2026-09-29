from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    """
    Evidence item grounded in actual recalled Hindsight long-term memories.
    """
    memory: str = Field(..., description="Recalled memory text supporting the answer")
    source: Optional[str] = Field(default=None, description="Source or title metadata from Hindsight if available")
    relevance: Optional[str] = Field(default=None, description="Explanation of how this evidence supports the answer")
    document_id: Optional[str] = Field(default=None, description="Document ID reference in Hindsight if available")
    memory_type: Optional[str] = Field(default=None, description="Classification or type of memory")
    date: Optional[str] = Field(default=None, description="Date or timestamp if present in metadata")


class AskRequest(BaseModel):
    """
    Request payload for asking questions about project evolution.
    """
    question: str = Field(
        ...,
        min_length=1,
        description="Historical or architectural question about the project's evolution"
    )


class AskResponse(BaseModel):
    """
    Response containing grounded answer, evidence from Hindsight, and confidence rating.
    """
    project_id: int = Field(..., description="Project ID queried")
    question: str = Field(..., description="The user's original question")
    answer: str = Field(..., description="Concise, grounded answer based strictly on recalled project memories")
    evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="Supporting evidence originating strictly from recalled Hindsight memories"
    )
    confidence: Literal["high", "medium", "low"] = Field(
        ...,
        description="Confidence level reflecting the amount and directness of retrieved evidence"
    )


class GroundedEvidence(BaseModel):
    """Internal model for structured Gemini reasoning response."""
    memory: str = Field(..., description="Quote or text from retrieved memory")
    source: Optional[str] = Field(default=None, description="Source or document identifier")
    relevance: Optional[str] = Field(default=None, description="Relevance explanation")


class ReasoningResult(BaseModel):
    """Internal model for structured Gemini reasoning output."""
    answer: str = Field(..., description="Grounded answer to the question")
    evidence: List[GroundedEvidence] = Field(default_factory=list, description="List of supporting evidence items")
    confidence: Literal["high", "medium", "low"] = Field(default="low", description="Confidence level")
