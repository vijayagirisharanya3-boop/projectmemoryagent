from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

InfoType = Literal[
    "meeting_note",
    "decision",
    "problem",
    "change",
    "failed_approach",
    "unresolved_issue"
]


class InformationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Summary title of the information")
    info_type: InfoType = Field(
        ...,
        description="Category: meeting_note, decision, problem, change, failed_approach, unresolved_issue"
    )
    content: str = Field(
        ...,
        min_length=1,
        description="The detailed information text that will be indexed into Hindsight long-term memory"
    )
    document_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional user-specified document or meeting identifier (e.g. meeting_001)"
    )


class InformationResponse(BaseModel):
    id: int
    project_id: int
    title: str
    info_type: str
    document_id: str
    created_at: datetime
    hindsight_retained: bool
    hindsight_bank_id: str
    hindsight_operation_id: Optional[str] = None


class InformationMetadataResponse(BaseModel):
    """
    Metadata representation of information/document stored in MySQL.
    Raw content/memories remain in Hindsight to prevent data redundancy.
    """
    id: int
    project_id: int
    title: str
    info_type: str
    document_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectInformationListResponse(BaseModel):
    project_id: int
    total: int
    records: list[InformationMetadataResponse]
