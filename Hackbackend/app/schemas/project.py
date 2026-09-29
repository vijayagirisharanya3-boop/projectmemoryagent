from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the project")
    description: Optional[str] = Field(None, description="Detailed description of the project")


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int


class ProjectDeleteResponse(BaseModel):
    project_id: int
    message: str
    hindsight_retained: bool = True
    note: str = (
        "Project record and relational metadata deleted from MySQL. "
        "Hindsight memory bank remains preserved for historical audit."
    )
