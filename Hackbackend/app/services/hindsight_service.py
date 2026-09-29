import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from hindsight_client import Hindsight, RecallResponse, RetainResponse
from app.config import settings
from app.schemas.memory import MemoryItem

logger = logging.getLogger(__name__)


class HindsightMemoryService:
    """
    Official Hindsight SDK client service for long-term memory operations.
    Maintains project isolation by scoping all operations to project-specific memory banks:
    `project_<project_id>`.
    """

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or settings.HINDSIGHT_BASE_URL
        self.api_key = api_key if api_key is not None else settings.HINDSIGHT_API_KEY
        self.client = Hindsight(
            base_url=self.base_url,
            api_key=self.api_key
        )

    def get_bank_id(self, project_id: int) -> str:
        """
        Enforces strict project isolation.
        Every project maps directly to an isolated Hindsight memory bank namespace.
        """
        return f"project_{project_id}"

    async def retain_memory(
        self,
        project_id: int,
        content: str,
        document_id: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> RetainResponse:
        """
        Stores and indexes new information into Hindsight's long-term memory bank for the project.
        Uses official async aretain() method.
        """
        bank_id = self.get_bank_id(project_id)
        try:
            response: RetainResponse = await self.client.aretain(
                bank_id=bank_id,
                content=content,
                document_id=document_id,
                metadata=metadata or {}
            )
            return response
        except Exception as exc:
            logger.error(f"Error retaining memory in Hindsight (bank_id={bank_id}): {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Hindsight memory store failed: {exc}. Ensure Hindsight server is running at {self.base_url}."
            )

    async def recall_memories(
        self,
        project_id: int,
        query: str = "",
        top_k: int = 5
    ) -> List[MemoryItem]:
        """
        Retrieves project-scoped memories from Hindsight.
        Uses official async arecall() method.
        Guarantees no cross-project leakage by querying solely within `project_<project_id>`.
        Limits results to the top_k most relevant memories (default: 5).
        """
        bank_id = self.get_bank_id(project_id)
        search_query = query.strip() if query and query.strip() else "project context facts"
        try:
            response: RecallResponse = await self.client.arecall(
                bank_id=bank_id,
                query=search_query
            )

            memory_items: List[MemoryItem] = []
            if response and response.results:
                for res in response.results:
                    memory_items.append(
                        MemoryItem(
                            id=res.id,
                            text=res.text,
                            type=getattr(res, "type", None),
                            entities=getattr(res, "entities", []) or [],
                            context=getattr(res, "context", None),
                            document_id=getattr(res, "document_id", None),
                            metadata=getattr(res, "metadata", {}) or {}
                        )
                    )
            return memory_items[:top_k]
        except Exception as exc:
            logger.error(f"Error recalling memories from Hindsight (bank_id={bank_id}): {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Hindsight memory recall failed: {exc}. Ensure Hindsight server is running at {self.base_url}."
            )


# Singleton instance
hindsight_service = HindsightMemoryService()
