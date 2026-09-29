"""
End-to-End Frontend Flow & Project Isolation Verification Script
Simulates the exact API calls made by the React frontend.
"""

import sys
import os
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def test_frontend_flow():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        print("1. Checking Backend Health...")
        health = client.get("/health").json()
        print("   Health:", health)
        assert health["status"] == "healthy"

        print("2. Listing Projects...")
        projects = client.get("/projects").json()["projects"]
        print(f"   Found {len(projects)} existing projects.")

        print("3. Creating Project A ('Database Migration Alpha')...")
        proj_a = client.post("/projects", json={
            "name": "Database Migration Alpha",
            "description": "Migration from MongoDB to PostgreSQL"
        }).json()
        proj_a_id = proj_a["id"]
        print(f"   Project A ID: {proj_a_id}")

        print("4. Creating Project B ('Auth Migration Beta')...")
        proj_b = client.post("/projects", json={
            "name": "Auth Migration Beta",
            "description": "Migration from Firebase to Supabase"
        }).json()
        proj_b_id = proj_b["id"]
        print(f"   Project B ID: {proj_b_id}")

        print("5. Adding & Processing Information for Project A...")
        text_a = (
            "During the database discussion, the team decided to move from MongoDB to PostgreSQL "
            "because MongoDB lacked ACID transactions for billing. Alice will lead the migration by Friday."
        )
        proc_a = client.post(f"/projects/{proj_a_id}/process", json={"content": text_a}).json()
        print("   Project A AI Extraction stored:", proc_a["stored"])

        print("6. Adding & Processing Information for Project B...")
        text_b = (
            "During the auth architecture meeting, the team decided to switch from Firebase to Supabase "
            "because Firebase vendor lock-in became a concern. Bob will lead the migration by Monday."
        )
        proc_b = client.post(f"/projects/{proj_b_id}/process", json={"content": text_b}).json()
        print("   Project B AI Extraction stored:", proc_b["stored"])

        print("7. Retrieving Memories for Project A...")
        mems_a = client.get(f"/projects/{proj_a_id}/memories").json()
        print(f"   Project A total memories: {mems_a['total_memories']}")
        assert mems_a['total_memories'] >= 1
        assert "postgresql" in mems_a['memories'][0]['text'].lower()
        assert "supabase" not in mems_a['memories'][0]['text'].lower()

        print("8. Retrieving Memories for Project B...")
        mems_b = client.get(f"/projects/{proj_b_id}/memories").json()
        print(f"   Project B total memories: {mems_b['total_memories']}")
        assert mems_b['total_memories'] >= 1
        assert "supabase" in mems_b['memories'][0]['text'].lower()
        assert "postgresql" not in mems_b['memories'][0]['text'].lower()

        print("9. Asking Project A: 'Why did we switch from MongoDB to PostgreSQL?'...")
        ask_a = client.post(f"/projects/{proj_a_id}/ask", json={"question": "Why did we switch from MongoDB to PostgreSQL?"}).json()
        print("   Project A Answer:", ask_a["answer"])
        print("   Project A Confidence:", ask_a["confidence"])
        print("   Project A Evidence count:", len(ask_a["evidence"]))
        assert ask_a["confidence"] in ["high", "medium"]
        assert len(ask_a["evidence"]) >= 1
        assert "postgresql" in ask_a["answer"].lower()

        print("10. Asking Project B the SAME question: 'Why did we switch from MongoDB to PostgreSQL?'...")
        ask_b_on_a = client.post(f"/projects/{proj_b_id}/ask", json={"question": "Why did we switch from MongoDB to PostgreSQL?"}).json()
        print("   Project B Answer on A's question:", ask_b_on_a["answer"])
        print("   Project B Confidence:", ask_b_on_a["confidence"])
        print("   Project B Evidence count:", len(ask_b_on_a["evidence"]))
        assert ask_b_on_a["confidence"] == "low"
        assert len(ask_b_on_a["evidence"]) == 0
        assert "not contain enough information" in ask_b_on_a["answer"].lower()

        print("11. Asking Project B its OWN question: 'Why did we switch from Firebase to Supabase?'...")
        # Since Firebase -> Supabase had "because Firebase vendor lock-in became a concern", let's verify Project B answers
        ask_b = client.post(f"/projects/{proj_b_id}/ask", json={"question": "Why did we switch from Firebase to Supabase?"}).json()
        print("   Project B Answer:", ask_b["answer"])
        print("   Project B Confidence:", ask_b["confidence"])
        print("   Project B Evidence count:", len(ask_b["evidence"]))
        assert ask_b["confidence"] in ["high", "medium"]
        assert len(ask_b["evidence"]) >= 1

        print("\n=======================================================")
        print("[SUCCESS] Complete Frontend Flow & Isolation Verified!")
        print("=======================================================")

if __name__ == "__main__":
    test_frontend_flow()
