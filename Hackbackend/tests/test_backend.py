"""
Automated Test Suite for Project Memory Agent Backend.
Covers the 10 core integration tests specified for Milestone 2 plus additional CRUD endpoints.
"""

import sys
import os
import time
import pytest
import httpx
from pymysql import connect

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings

BASE_URL = f"http://127.0.0.1:{settings.API_PORT}"


@pytest.fixture(scope="module")
def api_client():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        yield client


@pytest.fixture(scope="module")
def db_connection():
    conn = connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        charset="utf8mb4"
    )
    yield conn
    conn.close()


class TestProjectMemoryAgent:
    alpha_id = None
    beta_id = None

    def test_01_create_project_alpha(self, api_client):
        """TEST 1: Create Project Alpha."""
        payload = {
            "name": f"Project Alpha - {int(time.time())}",
            "description": "Enterprise cloud infrastructure project."
        }
        res = api_client.post("/projects", json=payload)
        assert res.status_code == 201, f"Failed to create Project Alpha: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert "created_at" in data
        assert "updated_at" in data
        TestProjectMemoryAgent.alpha_id = data["id"]
        print(f"\n[PASS] TEST 1: Created Project Alpha with ID {TestProjectMemoryAgent.alpha_id}")

    def test_02_create_project_beta(self, api_client):
        """TEST 2: Create Project Beta."""
        payload = {
            "name": f"Project Beta - {int(time.time())}",
            "description": "High-throughput analytics platform."
        }
        res = api_client.post("/projects", json=payload)
        assert res.status_code == 201, f"Failed to create Project Beta: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        TestProjectMemoryAgent.beta_id = data["id"]
        print(f"\n[PASS] TEST 2: Created Project Beta with ID {TestProjectMemoryAgent.beta_id}")

    def test_03_add_information_to_alpha(self, api_client):
        """TEST 3: Add information to Alpha: 'We selected MySQL for application data.'"""
        payload = {
            "title": "Alpha Database Decision",
            "info_type": "decision",
            "content": "We selected MySQL for application data."
        }
        res = api_client.post(f"/projects/{self.alpha_id}/information", json=payload)
        assert res.status_code == 201, f"Failed adding info to Alpha: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["hindsight_retained"] is True
        assert data["hindsight_bank_id"] == f"project_{self.alpha_id}"
        print(f"\n[PASS] TEST 3: Retained info in Project Alpha's Hindsight bank {data['hindsight_bank_id']}")

    def test_04_add_information_to_beta(self, api_client):
        """TEST 4: Add information to Beta: 'We selected PostgreSQL for application data.'"""
        payload = {
            "title": "Beta Database Decision",
            "info_type": "decision",
            "content": "We selected PostgreSQL for application data."
        }
        res = api_client.post(f"/projects/{self.beta_id}/information", json=payload)
        assert res.status_code == 201, f"Failed adding info to Beta: {res.text}"
        data = res.json()
        assert data["project_id"] == self.beta_id
        assert data["hindsight_retained"] is True
        assert data["hindsight_bank_id"] == f"project_{self.beta_id}"
        print(f"\n[PASS] TEST 4: Retained info in Project Beta's Hindsight bank {data['hindsight_bank_id']}")

    def test_05_retrieve_alpha_memories(self, api_client):
        """TEST 5: Retrieve Alpha memories. Expected: Alpha memory is returned."""
        res = api_client.get(f"/projects/{self.alpha_id}/memories", params={"query": "MySQL application data"})
        assert res.status_code == 200, f"Failed retrieving Alpha memories: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["total_memories"] > 0
        mem_texts = [m["text"] for m in data["memories"]]
        assert any("mysql" in t.lower() for t in mem_texts), f"Expected 'MySQL' in Alpha memories: {mem_texts}"
        print(f"\n[PASS] TEST 5: Successfully retrieved Alpha memories: {mem_texts}")

    def test_06_retrieve_beta_memories(self, api_client):
        """TEST 6: Retrieve Beta memories. Expected: Beta memory is returned."""
        res = api_client.get(f"/projects/{self.beta_id}/memories", params={"query": "PostgreSQL application data"})
        assert res.status_code == 200, f"Failed retrieving Beta memories: {res.text}"
        data = res.json()
        assert data["project_id"] == self.beta_id
        assert data["total_memories"] > 0
        mem_texts = [m["text"] for m in data["memories"]]
        assert any("postgresql" in t.lower() for t in mem_texts), f"Expected 'PostgreSQL' in Beta memories: {mem_texts}"
        print(f"\n[PASS] TEST 6: Successfully retrieved Beta memories: {mem_texts}")

    def test_07_verify_alpha_does_not_return_beta(self, api_client):
        """TEST 7: Verify Alpha retrieval does not return Beta memory."""
        res = api_client.get(f"/projects/{self.alpha_id}/memories", params={"query": "PostgreSQL"})
        data = res.json()
        mem_texts = [m["text"] for m in data["memories"]]
        for t in mem_texts:
            assert "postgresql" not in t.lower(), f"Leak! Alpha returned Beta memory: {t}"
        print("\n[PASS] TEST 7: Confirmed Alpha retrieval cannot access Beta memories.")

    def test_08_verify_beta_does_not_return_alpha(self, api_client):
        """TEST 8: Verify Beta retrieval does not return Alpha memory."""
        res = api_client.get(f"/projects/{self.beta_id}/memories", params={"query": "MySQL"})
        data = res.json()
        mem_texts = [m["text"] for m in data["memories"]]
        for t in mem_texts:
            assert "mysql" not in t.lower(), f"Leak! Beta returned Alpha memory: {t}"
        print("\n[PASS] TEST 8: Confirmed Beta retrieval cannot access Alpha memories.")

    def test_09_request_nonexistent_project_returns_404(self, api_client):
        """TEST 9: Request a nonexistent project. Expected: HTTP 404."""
        nonexistent_id = 99999999
        res_get = api_client.get(f"/projects/{nonexistent_id}")
        assert res_get.status_code == 404, f"Expected 404, got {res_get.status_code}"

        res_info = api_client.get(f"/projects/{nonexistent_id}/information")
        assert res_info.status_code == 404, f"Expected 404, got {res_info.status_code}"

        res_post_info = api_client.post(
            f"/projects/{nonexistent_id}/information",
            json={"title": "Test", "info_type": "decision", "content": "Sample content"}
        )
        assert res_post_info.status_code == 404, f"Expected 404, got {res_post_info.status_code}"

        res_mem = api_client.get(f"/projects/{nonexistent_id}/memories")
        assert res_mem.status_code == 404, f"Expected 404, got {res_mem.status_code}"

        res_del = api_client.delete(f"/projects/{nonexistent_id}")
        assert res_del.status_code == 404, f"Expected 404, got {res_del.status_code}"
        print("\n[PASS] TEST 9: Correctly returned HTTP 404 for all nonexistent project operations.")

    def test_10_verify_mysql_metadata_and_no_memory_duplication(self, db_connection):
        """TEST 10: Verify project information metadata exists in MySQL while the actual memory remains in Hindsight."""
        with db_connection.cursor() as cursor:
            # Check metadata rows exist in MySQL
            cursor.execute(
                "SELECT id, project_id, title, info_type, document_id FROM project_information WHERE project_id = %s;",
                (self.alpha_id,)
            )
            rows = cursor.fetchall()
            assert len(rows) > 0, "No metadata found in MySQL for Project Alpha!"
            row = rows[0]
            assert row[2] == "Alpha Database Decision"
            assert row[3] == "decision"
            assert row[4].startswith(f"doc_{self.alpha_id}_")

            # Check schema: confirm there is no content/body column
            cursor.execute("DESCRIBE project_information;")
            columns = [c[0].lower() for c in cursor.fetchall()]
            assert "content" not in columns, "Found 'content' column in MySQL table! Memories must not be duplicated."
            assert "text" not in columns, "Found 'text' column in MySQL table!"
        print("\n[PASS] TEST 10: Verified MySQL metadata storage with zero memory content duplication.")

    def test_11_get_project_information_metadata_endpoint(self, api_client):
        """TEST 11: GET /projects/{project_id}/information returns MySQL metadata records."""
        res = api_client.get(f"/projects/{self.alpha_id}/information")
        assert res.status_code == 200, f"Failed getting info metadata: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["total"] >= 1
        assert len(data["records"]) >= 1
        record = data["records"][0]
        assert record["title"] == "Alpha Database Decision"
        assert record["info_type"] == "decision"
        print(f"\n[PASS] TEST 11: GET /projects/{self.alpha_id}/information returned {data['total']} metadata record(s).")

    def test_12_delete_project_endpoint(self, api_client, db_connection):
        """TEST 12: DELETE /projects/{project_id} removes project and cascades metadata in MySQL."""
        # Create a temporary project to delete
        temp_res = api_client.post("/projects", json={"name": "Temp Project to Delete"})
        assert temp_res.status_code == 201
        temp_id = temp_res.json()["id"]

        # Add info
        api_client.post(
            f"/projects/{temp_id}/information",
            json={"title": "Temp Decision", "info_type": "decision", "content": "Temporary note."}
        )

        # Delete project
        del_res = api_client.delete(f"/projects/{temp_id}")
        assert del_res.status_code == 200, f"Delete failed: {del_res.text}"
        del_data = del_res.json()
        assert del_data["project_id"] == temp_id

        # Verify 404 upon subsequent request
        check_res = api_client.get(f"/projects/{temp_id}")
        assert check_res.status_code == 404

        # Verify deleted in MySQL
        with db_connection.cursor() as cursor:
            cursor.execute("SELECT id FROM projects WHERE id = %s;", (temp_id,))
            assert cursor.fetchone() is None
            cursor.execute("SELECT id FROM project_information WHERE project_id = %s;", (temp_id,))
            assert cursor.fetchall() == ()
        print(f"\n[PASS] TEST 12: Successfully deleted project {temp_id} and verified relational cascade.")

    def test_13_process_project_information_extraction(self, api_client):
        """TEST 13: POST /projects/{project_id}/process extracts structured facts from text."""
        content = (
            "We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing. "
            "MongoDB caused data inconsistency in the payment module. "
            "We previously tried using two-phase commits with MongoDB, but it failed due to complexity. "
            "Alice will lead the migration by Friday. Bob will review the schema. "
            "We still don't know how to handle historical analytics data."
        )
        res = api_client.post(f"/projects/{self.alpha_id}/process", json={"content": content})
        assert res.status_code == 200, f"Process endpoint failed: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["stored"] is True

        extracted = data["extracted_memories"]
        assert len(extracted["decisions"]) > 0
        assert any("postgresql" in d.lower() or "mongodb" in d.lower() for d in extracted["decisions"])
        assert len(extracted["reasons"]) > 0
        assert any("acid" in r.lower() or "billing" in r.lower() or "complexity" in r.lower() for r in extracted["reasons"])
        assert len(extracted["problems"]) > 0
        assert any("inconsistency" in p.lower() or "lacked" in p.lower() for p in extracted["problems"])
        assert len(extracted["changes"]) > 0
        assert len(extracted["previous_approaches"]) > 0
        assert any("two-phase commits" in pa.lower() or "mongodb" in pa.lower() for pa in extracted["previous_approaches"])
        assert len(extracted["failed_approaches"]) > 0
        assert any("two-phase commits" in fa.lower() or "failed" in fa.lower() for fa in extracted["failed_approaches"])
        assert len(extracted["action_items"]) > 0
        assert len(extracted["deadlines"]) > 0
        assert any("friday" in dl.lower() for dl in extracted["deadlines"])
        assert len(extracted["owners"]) > 0
        assert any("alice" in o.lower() for o in extracted["owners"])
        assert len(extracted["unresolved_questions"]) > 0
        assert any("analytics" in uq.lower() or "historical" in uq.lower() for uq in extracted["unresolved_questions"])
        print(f"\n[PASS] TEST 13: Successfully processed project evolution memories via AI extraction.")

    def test_14_process_information_retained_in_hindsight(self, api_client):
        """TEST 14: GET /projects/{project_id}/memories recalls the processed relational evolution."""
        res = api_client.get(f"/projects/{self.alpha_id}/memories", params={"query": "PostgreSQL MongoDB migration"})
        assert res.status_code == 200, f"Memory recall failed: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["total_memories"] > 0
        all_text = " ".join([m["text"] for m in data["memories"]]).lower()
        assert "postgresql" in all_text
        assert "two-phase commits" in all_text or "acid" in all_text
        print(f"\n[PASS] TEST 14: Confirmed AI-extracted relational memory is discoverable in Hindsight.")

    def test_15_process_information_project_isolation(self, api_client):
        """TEST 15: Verify Beta cannot recall Alpha's processed memories (Project Isolation)."""
        res = api_client.get(f"/projects/{self.beta_id}/memories", params={"query": "two-phase commits ACID billing"})
        assert res.status_code == 200
        data = res.json()
        all_text = " ".join([m["text"] for m in data["memories"]]).lower()
        assert "two-phase commits" not in all_text, "Leak! Beta retrieved Alpha's failed approach."
        assert "billing" not in all_text, "Leak! Beta retrieved Alpha's billing reason."
        print("\n[PASS] TEST 15: Confirmed strict project isolation for AI-processed memories.")

    def test_16_process_empty_or_neutral_content(self, api_client):
        """TEST 16: POST /projects/{project_id}/process with empty or neutral text returns empty lists."""
        res = api_client.post(f"/projects/{self.alpha_id}/process", json={"content": "Good morning team, hope you are doing well today."})
        assert res.status_code == 200
        data = res.json()
        extracted = data["extracted_memories"]
        assert extracted["decisions"] == []
        assert extracted["reasons"] == []
        assert extracted["unresolved_questions"] == []

        # Test completely empty string
        res_empty = api_client.post(f"/projects/{self.alpha_id}/process", json={"content": ""})
        assert res_empty.status_code == 200
        assert res_empty.json()["extracted_memories"]["decisions"] == []
        print("\n[PASS] TEST 16: Verified robust handling of empty and neutral text without exceptions.")

    def test_17_process_nonexistent_project_returns_404(self, api_client):
        """TEST 17: POST /projects/99999999/process returns HTTP 404."""
        res = api_client.post("/projects/99999999/process", json={"content": "We decided to do X."})
        assert res.status_code == 404
        print("\n[PASS] TEST 17: Verified HTTP 404 for processing memories on nonexistent project.")

    def test_18_verify_process_metadata_in_mysql_no_content_duplication(self, db_connection):
        """TEST 18: Verify MySQL stores metadata for processed memories without duplicating body text."""
        db_connection.commit()
        with db_connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, project_id, title, info_type, document_id FROM project_information WHERE project_id = %s AND document_id LIKE %s;",
                (self.alpha_id, f"ai_doc_{self.alpha_id}_%")
            )
            rows = cursor.fetchall()
            assert len(rows) > 0, "No AI metadata record found in MySQL for Project Alpha!"
            row = rows[0]
            assert row[1] == self.alpha_id
            assert row[4].startswith(f"ai_doc_{self.alpha_id}_")

            # Verify columns again: ensure no raw memory content
            cursor.execute("DESCRIBE project_information;")
            columns = [c[0].lower() for c in cursor.fetchall()]
            assert "content" not in columns
            assert "text" not in columns
        print("\n[PASS] TEST 18: Confirmed MySQL metadata logging for AI extraction with no text duplication.")

    def test_19_ask_valid_historical_question_why_switch(self, api_client):
        """TEST 19: POST /projects/{project_id}/ask answers why database was switched with grounded evidence."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": "Why did we switch from MongoDB to PostgreSQL?"}
        )
        assert res.status_code == 200, f"Ask failed: {res.text}"
        data = res.json()
        assert data["project_id"] == self.alpha_id
        assert data["question"] == "Why did we switch from MongoDB to PostgreSQL?"
        assert data["confidence"] in ["high", "medium"]
        ans_lower = data["answer"].lower()
        assert "postgresql" in ans_lower
        assert "acid" in ans_lower or "inconsistency" in ans_lower or "transaction" in ans_lower
        assert len(data["evidence"]) >= 1
        ev = data["evidence"][0]
        assert "memory" in ev and len(ev["memory"]) > 0
        assert "source" in ev
        assert "relevance" in ev
        assert "document_id" in ev
        print(f"\n[PASS] TEST 19: Successfully answered historical question with grounded evidence.")

    def test_20_ask_problem_caused_reconsidering(self, api_client):
        """TEST 20: POST /projects/{project_id}/ask retrieves problem obstacles from memory."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": "What problem caused us to reconsider MongoDB?"}
        )
        assert res.status_code == 200, f"Ask failed: {res.text}"
        data = res.json()
        ans_lower = data["answer"].lower()
        assert "inconsistency" in ans_lower or "acid" in ans_lower or "complexity" in ans_lower
        assert len(data["evidence"]) >= 1
        assert data["confidence"] in ["high", "medium"]
        print(f"\n[PASS] TEST 20: Successfully answered problem obstacle question from historical context.")

    def test_21_ask_unresolved_issues(self, api_client):
        """TEST 21: POST /projects/{project_id}/ask reports unresolved questions from memory."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": "What issues are still unresolved regarding the database?"}
        )
        assert res.status_code == 200, f"Ask failed: {res.text}"
        data = res.json()
        ans_lower = data["answer"].lower()
        assert "analytics" in ans_lower or "historical" in ans_lower
        assert len(data["evidence"]) >= 1
        assert data["confidence"] in ["high", "medium"]
        print(f"\n[PASS] TEST 21: Successfully retrieved unresolved project questions.")

    def test_22_ask_anti_hallucination_missing_person(self, api_client):
        """TEST 22: POST /projects/{project_id}/ask does not hallucinate when person/proposal author is unknown."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": "Who proposed the original MongoDB database architecture?"}
        )
        assert res.status_code == 200, f"Ask failed: {res.text}"
        data = res.json()
        ans_lower = data["answer"].lower()
        # Must clearly state that history does not identify who proposed/made the decision
        assert "does not identify" in ans_lower or "not enough information" in ans_lower or "not identify" in ans_lower
        assert data["confidence"] == "low"
        assert len(data["evidence"]) == 0
        print(f"\n[PASS] TEST 22: Verified anti-hallucination behavior when owner/author is unrecorded.")

    def test_23_ask_anti_hallucination_unrelated_topic(self, api_client):
        """TEST 23: POST /projects/{project_id}/ask states lack of info for unrecorded topics."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": "Why did we select Kubernetes for container orchestration?"}
        )
        assert res.status_code == 200
        data = res.json()
        ans_lower = data["answer"].lower()
        assert "not contain enough information" in ans_lower or "insufficient" in ans_lower
        assert data["confidence"] == "low"
        assert len(data["evidence"]) == 0
        print(f"\n[PASS] TEST 23: Verified no hallucination for questions outside project memory.")

    def test_24_ask_project_isolation_alpha_vs_beta(self, api_client):
        """TEST 24: Mandatory Section 12 isolation test: Project A (PostgreSQL) vs Project B (MongoDB)."""
        # Create dedicated Project A and Project B for mandatory isolation verification
        p_a = api_client.post("/projects", json={"name": f"Isolation Project A - {int(time.time())}"}).json()
        p_b = api_client.post("/projects", json={"name": f"Isolation Project B - {int(time.time())}"}).json()
        p_a_id = p_a["id"]
        p_b_id = p_b["id"]

        # Project A memory: 'The team selected PostgreSQL because transaction consistency was important.'
        api_client.post(
            f"/projects/{p_a_id}/information",
            json={
                "title": "PostgreSQL Selection",
                "info_type": "decision",
                "content": "The team selected PostgreSQL because transaction consistency was important."
            }
        )

        # Project B memory: 'The team selected MongoDB for rapid prototyping.'
        api_client.post(
            f"/projects/{p_b_id}/information",
            json={
                "title": "MongoDB Selection",
                "info_type": "decision",
                "content": "The team selected MongoDB for rapid prototyping."
            }
        )

        # Ask Project A: 'Why did we select PostgreSQL?' -> Must use Project A evidence
        res_a = api_client.post(
            f"/projects/{p_a_id}/ask",
            json={"question": "Why did we select PostgreSQL?"}
        )
        assert res_a.status_code == 200
        data_a = res_a.json()
        assert data_a["confidence"] in ["high", "medium"]
        assert len(data_a["evidence"]) >= 1
        assert "transaction" in data_a["answer"].lower()

        # Ask Project B: 'Why did we select PostgreSQL?' -> Must NOT use Project A's memory
        res_b = api_client.post(
            f"/projects/{p_b_id}/ask",
            json={"question": "Why did we select PostgreSQL?"}
        )
        assert res_b.status_code == 200
        data_b = res_b.json()
        ans_b_lower = data_b["answer"].lower()
        assert "not contain enough information" in ans_b_lower or "insufficient" in ans_b_lower
        assert len(data_b["evidence"]) == 0
        assert data_b["confidence"] == "low"
        print(f"\n[PASS] TEST 24: Confirmed mandatory Project A vs Project B isolation requirements.")

    def test_25_ask_nonexistent_project_returns_404(self, api_client):
        """TEST 25: POST /projects/99999999/ask returns HTTP 404."""
        res = api_client.post(
            "/projects/99999999/ask",
            json={"question": "Why did we switch from MongoDB to PostgreSQL?"}
        )
        assert res.status_code == 404
        print(f"\n[PASS] TEST 25: Correctly returned HTTP 404 for QA on nonexistent project.")

    def test_26_ask_empty_question_returns_422(self, api_client):
        """TEST 26: POST /projects/{project_id}/ask with empty question returns validation error HTTP 422."""
        res = api_client.post(
            f"/projects/{self.alpha_id}/ask",
            json={"question": ""}
        )
        assert res.status_code == 422
        print(f"\n[PASS] TEST 26: Correctly returned HTTP 422 for empty question.")

    # =========================================================================
    # MILESTONE 6: TEMPORAL / MEETING GROUNDING & FINAL HARDENING TESTS
    # =========================================================================

    meeting_proj_id = None

    def test_27_meeting_grounding_setup_add_notes_with_identity(self, api_client, db_connection):
        """TEST 27: Add Meeting 1 (MongoDB) and Meeting 2 (PostgreSQL) with preserved document/meeting identity."""
        # 1. Create dedicated project for meeting grounding verification
        proj_res = api_client.post("/projects", json={"name": f"Meeting Grounding Project - {int(time.time())}"})
        assert proj_res.status_code == 201
        TestProjectMemoryAgent.meeting_proj_id = proj_res.json()["id"]
        pid = TestProjectMemoryAgent.meeting_proj_id

        # 2. Add Meeting 1: MongoDB discussion
        res_m1 = api_client.post(
            f"/projects/{pid}/information",
            json={
                "title": "Database Discussion - Meeting 1",
                "document_id": "meeting_001",
                "info_type": "meeting_note",
                "content": "The team discussed MongoDB for flexible schema and rapid prototyping. Alice noted MongoDB would allow quick iteration."
            }
        )
        assert res_m1.status_code == 201
        data_m1 = res_m1.json()
        assert data_m1["document_id"] == "meeting_001"
        assert data_m1["hindsight_retained"] is True

        # 3. Add Meeting 2: PostgreSQL switch decision
        res_m2 = api_client.post(
            f"/projects/{pid}/information",
            json={
                "title": "Database Decision - Meeting 2",
                "document_id": "meeting_002",
                "info_type": "decision",
                "content": "The team switched to PostgreSQL because MongoDB lacked ACID transactions for billing. Bob will lead migration by Friday."
            }
        )
        assert res_m2.status_code == 201
        data_m2 = res_m2.json()
        assert data_m2["document_id"] == "meeting_002"
        assert data_m2["hindsight_retained"] is True

        # 4. Verify MySQL metadata preservation
        db_connection.commit()
        with db_connection.cursor() as cursor:
            cursor.execute(
                "SELECT title, document_id, info_type FROM project_information WHERE project_id = %s ORDER BY id ASC;",
                (pid,)
            )
            rows = cursor.fetchall()
            assert len(rows) == 2
            assert rows[0][0] == "Database Discussion - Meeting 1"
            assert rows[0][1] == "meeting_001"
            assert rows[1][0] == "Database Decision - Meeting 2"
            assert rows[1][1] == "meeting_002"
        print(f"\n[PASS] TEST 27: Successfully recorded Meeting 1 & Meeting 2 with explicit identity in project {pid}.")

    def test_28_ask_meeting_1_specific_question_strict_isolation(self, api_client):
        """TEST 28: Ask 'What happened in Meeting 1?' -> Must cite Meeting 1 facts and NEVER leak Meeting 2 facts."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "What happened in Meeting 1?"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["confidence"] in ["high", "medium"]
        ans_lower = data["answer"].lower()

        # Must describe MongoDB / rapid prototyping / Alice
        assert "mongodb" in ans_lower
        assert "prototyping" in ans_lower or "iteration" in ans_lower or "schema" in ans_lower

        # STRICT ISOLATION: MUST NOT mention PostgreSQL, Bob, or ACID billing (which occurred in Meeting 2)
        assert "postgresql" not in ans_lower, f"Leak! Meeting 1 answer mentioned PostgreSQL: {data['answer']}"
        assert "bob" not in ans_lower, f"Leak! Meeting 1 answer mentioned Bob: {data['answer']}"

        # Evidence must strictly come from Meeting 1
        assert len(data["evidence"]) >= 1
        for ev in data["evidence"]:
            assert ev["document_id"] == "meeting_001" or "meeting 1" in ev["source"].lower()
            assert "postgresql" not in ev["memory"].lower()
        print(f"\n[PASS] TEST 28: Verified strict meeting isolation: Meeting 1 answered without leaking Meeting 2.")

    def test_29_ask_meeting_2_specific_question(self, api_client):
        """TEST 29: Ask 'What was decided in Meeting 2?' -> Must answer PostgreSQL decision and migration owner."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "What was decided in Meeting 2?"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["confidence"] in ["high", "medium"]
        ans_lower = data["answer"].lower()

        # Must mention PostgreSQL decision and Bob / Friday / ACID
        assert "postgresql" in ans_lower
        assert "acid" in ans_lower or "billing" in ans_lower or "bob" in ans_lower or "migration" in ans_lower

        # Evidence must strictly cite Meeting 2
        assert len(data["evidence"]) >= 1
        for ev in data["evidence"]:
            assert ev["document_id"] == "meeting_002" or "meeting 2" in ev["source"].lower()
        print(f"\n[PASS] TEST 29: Verified Meeting 2 decision answered accurately with Meeting 2 evidence.")

    def test_30_ask_meeting_1_about_postgresql_refusal(self, api_client):
        """TEST 30: Ask 'What did Meeting 1 say about PostgreSQL?' -> Must refuse honestly with low confidence."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "What did Meeting 1 say about PostgreSQL?"}
        )
        assert res.status_code == 200
        data = res.json()
        ans_lower = data["answer"].lower()

        # Must state that Meeting 1 did not mention PostgreSQL or history lacks information
        assert "did not mention" in ans_lower or "not enough information" in ans_lower or "not contain" in ans_lower or "insufficient" in ans_lower
        assert data["confidence"] == "low"
        assert len(data["evidence"]) == 0
        print(f"\n[PASS] TEST 30: Verified anti-hallucination refusal when meeting did not discuss requested topic.")

    def test_31_ask_cross_meeting_evolution_why_switch(self, api_client):
        """TEST 31: Ask 'Why did we eventually switch from MongoDB to PostgreSQL?' -> Cross-meeting synthesis allowed."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "Why did we eventually switch from MongoDB to PostgreSQL?"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["confidence"] in ["high", "medium"]
        ans_lower = data["answer"].lower()

        # Answers cross-meeting evolution
        assert "postgresql" in ans_lower
        assert "acid" in ans_lower or "billing" in ans_lower or "inconsistency" in ans_lower
        assert len(data["evidence"]) >= 1
        print(f"\n[PASS] TEST 31: Successfully synthesized cross-meeting architectural evolution.")

    def test_32_ask_nonexistent_meeting_refusal(self, api_client):
        """TEST 32: Ask 'What was decided in Meeting 5?' -> Must refuse with low confidence and empty evidence."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "What was decided in Meeting 5?"}
        )
        assert res.status_code == 200
        data = res.json()
        ans_lower = data["answer"].lower()
        assert "not contain" in ans_lower or "insufficient" in ans_lower
        assert data["confidence"] == "low"
        assert len(data["evidence"]) == 0
        print(f"\n[PASS] TEST 32: Correctly refused unrecorded meeting query with zero hallucination.")

    def test_33_ask_anti_hallucination_unrecorded_aws_refusal(self, api_client):
        """TEST 33: Ask 'Who approved the AWS migration?' -> Must refuse with low confidence and empty evidence."""
        pid = self.meeting_proj_id
        res = api_client.post(
            f"/projects/{pid}/ask",
            json={"question": "Who approved the AWS migration?"}
        )
        assert res.status_code == 200
        data = res.json()
        ans_lower = data["answer"].lower()
        assert "not contain enough information" in ans_lower or "insufficient" in ans_lower
        assert data["confidence"] == "low"
        assert len(data["evidence"]) == 0
        print(f"\n[PASS] TEST 33: Successfully refused unrecorded AWS question with low confidence and empty evidence.")

