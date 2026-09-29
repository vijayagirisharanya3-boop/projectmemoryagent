"""
=============================================================================
OPTIONAL LOCAL DEVELOPMENT UTILITY: Mock Hindsight API Server
=============================================================================
WARNING / NOTICE:
This is a lightweight local mock server implementing the official Hindsight REST
protocol for offline development and local simulation when an external Hindsight
instance (Docker/Cloud) or external LLM API key is not available.

Do NOT treat mock success as proof of real Hindsight integration.
In production and primary testing, configure HINDSIGHT_BASE_URL to point to a
real running Hindsight server.
=============================================================================
"""

import uuid
from typing import Dict, List, Any
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

app = FastAPI(
    title="[MOCK] Hindsight API Server",
    description="Development/Testing mock server simulating Hindsight REST API endpoints.",
    version="0.10.1-mock"
)

# In-memory memory bank store: bank_id -> list of memory items
memory_banks: Dict[str, List[Dict[str, Any]]] = {}


@app.get("/health")
def mock_health():
    return {
        "status": "ok",
        "service": "mock-hindsight-server",
        "banks_count": len(memory_banks)
    }


@app.post("/v1/default/banks/{bank_id}/memories", status_code=status.HTTP_200_OK)
async def retain_memory(bank_id: str, request: Request):
    """
    Simulates the official Hindsight `POST /v1/default/banks/{bank_id}/memories` endpoint.
    Accepts RetainRequest payload and indexes items under the specified bank_id.
    """
    body = await request.json()
    items = body.get("items", [])

    if bank_id not in memory_banks:
        memory_banks[bank_id] = []

    operation_id = f"op_{uuid.uuid4().hex[:12]}"
    created_count = 0

    for item in items:
        memory_id = f"mem_{uuid.uuid4().hex[:8]}"
        content = item.get("content", "")
        document_id = item.get("document_id")
        metadata = item.get("metadata", {})

        memory_banks[bank_id].append({
            "id": memory_id,
            "text": content,
            "type": "fact",
            "document_id": document_id,
            "metadata": metadata,
            "entities": []
        })
        created_count += 1

    return {
        "success": True,
        "bank_id": bank_id,
        "items_count": created_count,
        "async": False,
        "operation_id": operation_id,
        "operation_ids": [operation_id]
    }


@app.post("/v1/default/banks/{bank_id}/memories/recall", status_code=status.HTTP_200_OK)
async def recall_memories(bank_id: str, request: Request):
    """
    Simulates the official Hindsight `POST /v1/default/banks/{bank_id}/memories/recall` endpoint.
    Retrieves memories strictly partitioned within the specified bank_id.
    """
    body = await request.json()
    query = body.get("query", "").lower().strip()

    stored_items = memory_banks.get(bank_id, [])
    results = []

    # Semantic/keyword simulation: match words in text or metadata, or return all if query is generic
    for item in stored_items:
        text = item["text"].lower()
        meta_str = " ".join(str(v).lower() for v in item.get("metadata", {}).values())
        combined = f"{text} {meta_str}"
        if not query or any(word in combined for word in query.split()) or "context" in query or "facts" in query:
            results.append({
                "id": item["id"],
                "text": item["text"],
                "type": item.get("type", "fact"),
                "document_id": item.get("document_id"),
                "metadata": item.get("metadata", {}),
                "entities": item.get("entities", [])
            })

    return {
        "results": results,
        "trace": None,
        "entities": {},
        "chunks": {},
        "source_facts": None,
        "source_facts_truncated": False
    }


@app.get("/v1/default/banks/{bank_id}/memories", status_code=status.HTTP_200_OK)
def list_memories(bank_id: str, limit: int = 100, offset: int = 0):
    """
    Simulates the official Hindsight `GET /v1/default/banks/{bank_id}/memories` endpoint.
    """
    stored_items = memory_banks.get(bank_id, [])
    paginated = stored_items[offset: offset + limit]
    return {
        "items": paginated,
        "total": len(stored_items),
        "limit": limit,
        "offset": offset
    }


if __name__ == "__main__":
    print("Starting [MOCK] Hindsight API Server on http://127.0.0.1:8888 ...")
    uvicorn.run(app, host="127.0.0.1", port=8888, log_level="info")
