from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MemoryItem(BaseModel):
    id: str = Field(..., description="Unique memory ID assigned by Hindsight")
    text: str = Field(..., description="The recalled memory text/fact")
    type: Optional[str] = Field(None, description="Memory type classified by Hindsight (e.g., fact, opinion, observation)")
    entities: Optional[List[str]] = Field(default_factory=list, description="Linked entities identified in memory")
    context: Optional[str] = Field(None, description="Context associated with the memory")
    document_id: Optional[str] = Field(None, description="Reference document ID")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata associated with the memory")


class MemoryRecallResponse(BaseModel):
    project_id: int
    bank_id: str
    query: str
    total_memories: int
    memories: List[MemoryItem]
