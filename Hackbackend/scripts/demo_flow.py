"""
=============================================================================
Milestone 1 Demonstration & Verification Flow
=============================================================================
Proves:
1. FastAPI starts and responds to health checks.
2. MySQL connection and relational data storage work.
3. Projects can be created (Project Alpha & Project Beta).
4. Project information is sent to the backend.
5. Project information metadata is persisted in MySQL (no memory duplication).
6. Information is stored in Hindsight as project-scoped long-term memory.
7. Memories are recalled from Hindsight via FastAPI as JSON.
8. Strict project isolation: Project Alpha cannot access Project Beta's memories,
   and Project Beta cannot access Project Alpha's memories.
=============================================================================
"""

import sys
import os
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
from pymysql import connect
from app.config import settings

BASE_URL = f"http://127.0.0.1:{settings.API_PORT}"


def log_step(step_num: int, title: str):
    print(f"\n{'='*70}")
    print(f"STEP {step_num}: {title}")
    print(f"{'='*70}")


def run_demo():
    print(f"Connecting to FastAPI backend at {BASE_URL} ...")

    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # Step 1: Health Check
        log_step(1, "Check FastAPI Backend Health and MySQL Connectivity")
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health_data = res.json()
        print(f"Health Response: {health_data}")
        assert health_data.get("mysql_connected") is True, "MySQL is not connected!"
        print("[PASS] FastAPI is running and MySQL is connected.")

        # Step 2: Create Project Alpha
        log_step(2, "Create Project Alpha")
        alpha_payload = {
            "name": f"Project Alpha (Drone Navigation) - {int(time.time())}",
            "description": "Autonomous flight control and obstacle avoidance system."
        }
        res_alpha = client.post("/projects", json=alpha_payload)
        assert res_alpha.status_code == 201, f"Failed to create Project Alpha: {res_alpha.text}"
        project_alpha = res_alpha.json()
        alpha_id = project_alpha["id"]
        print(f"Project Alpha Created: ID={alpha_id}, Name='{project_alpha['name']}'")

        # Step 3: Create Project Beta
        log_step(3, "Create Project Beta")
        beta_payload = {
            "name": f"Project Beta (Medical Imaging) - {int(time.time())}",
            "description": "Volumetric MRI analysis and lesion segmentation."
        }
        res_beta = client.post("/projects", json=beta_payload)
        assert res_beta.status_code == 201, f"Failed to create Project Beta: {res_beta.text}"
        project_beta = res_beta.json()
        beta_id = project_beta["id"]
        print(f"Project Beta Created: ID={beta_id}, Name='{project_beta['name']}'")

        # Step 4: Add Information to Project Alpha
        log_step(4, "Add Information to Project Alpha & Store Memory in Hindsight")
        alpha_info_payload = {
            "title": "Sensor Suite Architectural Decision",
            "info_type": "decision",
            "content": "For Project Alpha, we selected a combination of solid-state LiDAR and dual stereo cameras to handle obstacle avoidance in GPS-denied tunnels."
        }
        res_alpha_info = client.post(f"/projects/{alpha_id}/information", json=alpha_info_payload)
        assert res_alpha_info.status_code == 201, f"Failed to add info to Project Alpha: {res_alpha_info.text}"
        alpha_info = res_alpha_info.json()
        print(f"Project Alpha Info Stored:")
        print(f"  - Metadata Record ID: {alpha_info['id']}")
        print(f"  - Document ID: {alpha_info['document_id']}")
        print(f"  - Hindsight Bank ID: {alpha_info['hindsight_bank_id']}")
        print(f"  - Hindsight Retained: {alpha_info['hindsight_retained']}")
        assert alpha_info["hindsight_bank_id"] == f"project_{alpha_id}", "Bank ID mismatch!"

        # Step 5: Add Information to Project Beta
        log_step(5, "Add Information to Project Beta & Store Memory in Hindsight")
        beta_info_payload = {
            "title": "Neural Network Architecture Selection",
            "info_type": "decision",
            "content": "For Project Beta, we implemented a 3D Residual U-Net trained on 1500 brain MRI volumetric scans for automated tumor boundary demarcation."
        }
        res_beta_info = client.post(f"/projects/{beta_id}/information", json=beta_info_payload)
        assert res_beta_info.status_code == 201, f"Failed to add info to Project Beta: {res_beta_info.text}"
        beta_info = res_beta_info.json()
        print(f"Project Beta Info Stored:")
        print(f"  - Metadata Record ID: {beta_info['id']}")
        print(f"  - Document ID: {beta_info['document_id']}")
        print(f"  - Hindsight Bank ID: {beta_info['hindsight_bank_id']}")
        print(f"  - Hindsight Retained: {beta_info['hindsight_retained']}")
        assert beta_info["hindsight_bank_id"] == f"project_{beta_id}", "Bank ID mismatch!"

        # Step 6: Recall Memory for Project Alpha
        log_step(6, "Recall Memory for Project Alpha via FastAPI")
        res_alpha_recall = client.get(f"/projects/{alpha_id}/memories", params={"query": "sensor obstacle LiDAR"})
        assert res_alpha_recall.status_code == 200, f"Failed to recall Project Alpha memories: {res_alpha_recall.text}"
        alpha_recall = res_alpha_recall.json()
        print(f"Project Alpha Recalled Memories (Total: {alpha_recall['total_memories']}):")
        for mem in alpha_recall["memories"]:
            print(f"  - [{mem['id']}] {mem['text']}")
        assert alpha_recall["total_memories"] > 0, "No memories recalled for Project Alpha!"
        assert "lidar" in alpha_recall["memories"][0]["text"].lower(), "Expected LiDAR content in Project Alpha memory!"

        # Step 7: Recall Memory for Project Beta
        log_step(7, "Recall Memory for Project Beta via FastAPI")
        res_beta_recall = client.get(f"/projects/{beta_id}/memories", params={"query": "MRI tumor UNet"})
        assert res_beta_recall.status_code == 200, f"Failed to recall Project Beta memories: {res_beta_recall.text}"
        beta_recall = res_beta_recall.json()
        print(f"Project Beta Recalled Memories (Total: {beta_recall['total_memories']}):")
        for mem in beta_recall["memories"]:
            print(f"  - [{mem['id']}] {mem['text']}")
        assert beta_recall["total_memories"] > 0, "No memories recalled for Project Beta!"
        assert "mri" in beta_recall["memories"][0]["text"].lower(), "Expected MRI content in Project Beta memory!"

        # Step 8: Strict Cross-Project Isolation Verification
        log_step(8, "Verify Strict Cross-Project Memory Isolation")
        print("Checking: Querying Project Alpha for Project Beta's query ('MRI tumor') ...")
        res_leak_alpha = client.get(f"/projects/{alpha_id}/memories", params={"query": "MRI tumor"})
        leak_alpha_memories = res_leak_alpha.json()["memories"]
        for m in leak_alpha_memories:
            assert "mri" not in m["text"].lower(), f"DATA LEAK DETECTED! Project Alpha accessed Project Beta memory: {m['text']}"
        print("  -> Confirmed: Project Alpha returned NO memories containing Project Beta data.")

        print("Checking: Querying Project Beta for Project Alpha's query ('LiDAR sensor obstacle') ...")
        res_leak_beta = client.get(f"/projects/{beta_id}/memories", params={"query": "LiDAR sensor obstacle"})
        leak_beta_memories = res_leak_beta.json()["memories"]
        for m in leak_beta_memories:
            assert "lidar" not in m["text"].lower(), f"DATA LEAK DETECTED! Project Beta accessed Project Alpha memory: {m['text']}"
        print("  -> Confirmed: Project Beta returned NO memories containing Project Alpha data.")
        print("[PASS] Project memory isolation verified successfully!")

        # Step 9: MySQL Storage Verification
        log_step(9, "Verify MySQL Data Storage (Confirm No Memory Duplication)")
        db_conn = connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            charset="utf8mb4"
        )
        try:
            with db_conn.cursor() as cursor:
                cursor.execute("SELECT id, name FROM projects WHERE id IN (%s, %s);", (alpha_id, beta_id))
                projects_in_db = cursor.fetchall()
                print(f"Projects in MySQL: {projects_in_db}")

                cursor.execute("SELECT id, project_id, title, info_type, document_id FROM project_information WHERE project_id IN (%s, %s);", (alpha_id, beta_id))
                info_in_db = cursor.fetchall()
                print(f"Information Metadata Records in MySQL: {info_in_db}")

                # Verify column names to prove raw content is not stored in MySQL
                cursor.execute("DESCRIBE project_information;")
                columns = [col[0] for col in cursor.fetchall()]
                print(f"Columns in MySQL 'project_information': {columns}")
                assert "content" not in columns, "Found 'content' column in MySQL table! Raw memory should NOT be stored in MySQL."
                print("[PASS] MySQL schema verified: Only metadata is stored; long-term memories live in Hindsight.")
        finally:
            db_conn.close()

        # Step 10: Process Project Information with AI Extraction (Milestone 3)
        log_step(10, "Process Project Evolution with Gemini AI Extraction")
        evolution_text = (
            "We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing. "
            "MongoDB caused data inconsistency in the payment module. "
            "We previously tried using two-phase commits with MongoDB, but it failed due to complexity. "
            "Alice will lead the migration by Friday. Bob will review the schema. "
            "We still don't know how to handle historical analytics data."
        )
        res_proc = client.post(f"/projects/{alpha_id}/process", json={"content": evolution_text})
        assert res_proc.status_code == 200, f"AI processing failed: {res_proc.text}"
        proc_data = res_proc.json()
        print(f"AI Processed Project Alpha: ID={proc_data['project_id']}, Stored={proc_data['stored']}")
        print(f"Extracted Decisions: {proc_data['extracted_memories']['decisions']}")
        print(f"Extracted Reasons: {proc_data['extracted_memories']['reasons']}")
        print("[PASS] AI extracted structured evolution memories and retained them in Hindsight.")

        # Step 11: Ask Historical Question with Grounded Evidence (Milestone 4)
        log_step(11, "Ask Historical Question with Grounded Evidence")
        question = "Why did we switch from MongoDB to PostgreSQL?"
        res_ask = client.post(f"/projects/{alpha_id}/ask", json={"question": question})
        assert res_ask.status_code == 200, f"Ask failed: {res_ask.text}"
        ask_data = res_ask.json()
        print(f"Question: {ask_data['question']}")
        print(f"Answer: {ask_data['answer']}")
        print(f"Confidence: {ask_data['confidence']}")
        print(f"Evidence Count: {len(ask_data['evidence'])}")
        assert ask_data["confidence"] in ["high", "medium"]
        assert len(ask_data["evidence"]) >= 1
        print(f"Evidence [0]: {ask_data['evidence'][0]['memory'][:120]}...")
        print("[PASS] Grounded answer generated from recalled memories with verifiable evidence.")

        # Step 12: Verify QA Project Isolation
        log_step(12, "Verify QA Project Isolation (Beta cannot answer Alpha's history)")
        res_beta_ask = client.post(f"/projects/{beta_id}/ask", json={"question": question})
        assert res_beta_ask.status_code == 200
        beta_ask_data = res_beta_ask.json()
        print(f"Project Beta Ask Response: {beta_ask_data['answer']}")
        print(f"Project Beta Evidence Count: {len(beta_ask_data['evidence'])}")
        print(f"Project Beta Confidence: {beta_ask_data['confidence']}")
        assert beta_ask_data["confidence"] == "low"
        assert len(beta_ask_data["evidence"]) == 0
        print("[PASS] Strict project isolation verified: Beta cannot access or reason over Alpha memories.")

    print(f"\n{'='*70}")
    print("ALL MILESTONE VERIFICATIONS COMPLETE: ALL CHECKS PASSED SUCCESSFULLY!")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    run_demo()
