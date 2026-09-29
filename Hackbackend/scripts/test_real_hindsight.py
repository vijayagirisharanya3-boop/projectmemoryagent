"""
Direct Hindsight Integration & Project Isolation Test.
Uses the official hindsight-client SDK to verify direct retain and recall operations
against the Hindsight server configured via HINDSIGHT_BASE_URL.
"""

import sys
import os
import asyncio

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import hindsight_client
from hindsight_client import Hindsight, RecallResponse, RetainResponse
from app.config import settings


async def test_hindsight():
    print(f"Hindsight Client SDK Version: {getattr(hindsight_client, '__version__', '0.10.1')}")
    print(f"Connecting to Hindsight Server at: {settings.HINDSIGHT_BASE_URL}")

    client = Hindsight(
        base_url=settings.HINDSIGHT_BASE_URL,
        api_key=settings.HINDSIGHT_API_KEY
    )

    bank_alpha = "project_991"
    bank_beta = "project_992"

    print(f"\n1. Retaining memory in Bank Alpha ({bank_alpha})...")
    res_alpha: RetainResponse = await client.aretain(
        bank_id=bank_alpha,
        content="Project Alpha decision: Using MySQL for metadata and Hindsight for long-term memory.",
        document_id="doc_alpha_001",
        metadata={"project": "Alpha", "topic": "architecture"}
    )
    print(f"   Alpha Retain Result: success={res_alpha.success}, items_count={res_alpha.items_count}")

    print(f"\n2. Retaining memory in Bank Beta ({bank_beta})...")
    res_beta: RetainResponse = await client.aretain(
        bank_id=bank_beta,
        content="Project Beta decision: Using PostgreSQL for metadata and Redis for cache.",
        document_id="doc_beta_001",
        metadata={"project": "Beta", "topic": "architecture"}
    )
    print(f"   Beta Retain Result: success={res_beta.success}, items_count={res_beta.items_count}")

    print(f"\n3. Recalling memory from Bank Alpha ({bank_alpha})...")
    recall_alpha: RecallResponse = await client.arecall(
        bank_id=bank_alpha,
        query="architecture database"
    )
    print(f"   Alpha recalled {len(recall_alpha.results)} items:")
    for r in recall_alpha.results:
        print(f"     - {r.text}")
    assert len(recall_alpha.results) > 0, "Failed to recall Alpha memory!"
    assert "mysql" in recall_alpha.results[0].text.lower(), "Alpha memory missing MySQL!"

    print(f"\n4. Recalling memory from Bank Beta ({bank_beta})...")
    recall_beta: RecallResponse = await client.arecall(
        bank_id=bank_beta,
        query="architecture database"
    )
    print(f"   Beta recalled {len(recall_beta.results)} items:")
    for r in recall_beta.results:
        print(f"     - {r.text}")
    assert len(recall_beta.results) > 0, "Failed to recall Beta memory!"
    assert "postgresql" in recall_beta.results[0].text.lower(), "Beta memory missing PostgreSQL!"

    print(f"\n5. Verifying Strict Project Isolation...")
    # Query Alpha for Redis/Postgres
    leak_test_1: RecallResponse = await client.arecall(
        bank_id=bank_alpha,
        query="PostgreSQL Redis"
    )
    for r in leak_test_1.results:
        assert "postgresql" not in r.text.lower(), f"Leak! Alpha recalled Beta memory: {r.text}"
    print("   [OK] Bank Alpha cannot access Bank Beta's memory.")

    # Query Beta for MySQL/Hindsight
    leak_test_2: RecallResponse = await client.arecall(
        bank_id=bank_beta,
        query="MySQL Hindsight"
    )
    for r in leak_test_2.results:
        assert "mysql" not in r.text.lower(), f"Leak! Beta recalled Alpha memory: {r.text}"
    print("   [OK] Bank Beta cannot access Bank Alpha's memory.")

    print("\n[OK] ALL DIRECT HINDSIGHT SDK TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(test_hindsight())
