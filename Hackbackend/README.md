# Project Memory Agent - Full Stack Architecture (Milestones 1–6)

Minimal, production-ready FastAPI backend for **Project Memory Agent**.

## Tech Stack
* **Language & Framework**: Python 3.10+, FastAPI, Uvicorn
* **Relational Database**: MySQL Server (via SQLAlchemy and PyMySQL)
* **Long-Term Project Memory**: Hindsight (via official `hindsight-client` Python SDK)
* **AI Extraction & Reasoning**: Google Gemini (via official `google-genai` SDK with JSON schema enforcement)
* **Data Validation**: Pydantic v2 & Pydantic Settings
* **CORS Support**: Configured for React / Vite / Next.js frontends

---

## Architecture Overview

```
Hack backend/
├── app/
│   ├── main.py                  # FastAPI entry point, CORS, lifespan, exception handlers
│   ├── config.py                # Environment configuration loaded from .env
│   ├── database.py              # MySQL connection & session management
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py              # User model
│   │   ├── project.py           # Project model
│   │   └── document.py          # Document/Information metadata model (No raw memories duplicated!)
│   ├── schemas/                 # Pydantic request & response models
│   │   ├── project.py           # Project schemas (ProjectCreate, ProjectResponse)
│   │   ├── information.py       # Information schemas (InformationCreate, InformationResponse)
│   │   ├── memory.py            # Memory schemas (MemoryItem, MemoryRecallResponse)
│   │   ├── ai.py                # AI schemas (ExtractedMemories, ProjectProcessRequest, ProjectProcessResponse)
│   │   └── qa.py                # QA schemas (AskRequest, AskResponse, EvidenceItem, ReasoningResult)
│   ├── services/
│   │   ├── project_service.py   # Project MySQL database operations
│   │   ├── hindsight_service.py # Official Hindsight SDK client wrapper (aretain / arecall)
│   │   └── ai_service.py        # Gemini AI extractor & reasoning agent (structured evolution schemas)
│   └── routers/
│       ├── projects.py          # POST /projects, GET /projects, GET /projects/{id}
│       └── information.py       # POST /information, GET /memories, POST /process, POST /ask
├── frontend/                    # Hackathon React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Navbar, ProjectList, ProjectDashboard, AskAI, MemoriesView, AddInformation
│   │   ├── api.js               # Centralized API client (VITE_API_BASE_URL)
│   │   ├── App.jsx              # Main React application
│   │   └── index.css            # Modern dark slate UI theme
│   ├── .env                     # VITE_API_BASE_URL=http://127.0.0.1:8000
│   └── package.json
├── scripts/
│   ├── init_db.py               # Initializes MySQL database & tables
│   ├── test_real_hindsight.py   # Direct Hindsight SDK integration & isolation test
│   ├── mock_hindsight_server.py # Optional local fallback/mock server for offline dev
│   ├── demo_flow.py             # End-to-end verification script
│   └── verify_frontend_flow.py  # Complete frontend integration & isolation test
├── .env.example                 # Example environment variables
├── .env                         # Local environment configuration
└── requirements.txt             # Python dependencies
```

---

## Storage Separation (Zero Memory Duplication)

* **MySQL**:
  * Stores relational application state: `users`, `projects`, and `project_information` (metadata only: `id`, `project_id`, `title`, `info_type`, `document_id`, `created_at`).
  * **Does NOT duplicate raw memories** in MySQL.
* **Hindsight**:
  * Serves as the dedicated long-term project memory system.
  * Information text and extracted facts live in Hindsight.
  * Every project is assigned an isolated memory bank: `project_<project_id>`.

---

## Quick Setup Instructions

### 1. Set Up Environment & Install Dependencies
Activate your virtual environment and install the required dependencies:
```bash
python -m venv .venv
.\.venv\Scripts\activate   # On Windows
pip install -r requirements.txt
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` and verify your MySQL and Hindsight settings:
```ini
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=project_memory_db

# Hindsight Server URL (e.g., self-hosted, Docker, or Hindsight Cloud)
HINDSIGHT_BASE_URL=http://localhost:8888
HINDSIGHT_API_KEY=

# Google Gemini API Key for AI Memory Extraction
GEMINI_API_KEY=your_gemini_api_key_here

API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 3. Initialize MySQL Database & Tables
Run the database initialization script:
```bash
python scripts/init_db.py
```
This automatically connects to MySQL, creates `project_memory_db` if it doesn't already exist, and generates the `projects`, `users`, and `project_information` tables.

---

## Running the Services

### Option A: Running with Real Hindsight Server
Point `HINDSIGHT_BASE_URL` in `.env` to your Hindsight server:
```bash
# Example if using Docker:
docker run -p 8888:8888 ghcr.io/vectorize-io/hindsight:latest
```

### Option B: Running with Optional Local Mock Server (Development Fallback)
For offline development or quick local hackathon testing when an external Hindsight instance or LLM key is not available, start the local mock server:
```bash
python scripts/mock_hindsight_server.py
```
*(This mock server strictly implements the official Hindsight REST API endpoints: `POST /v1/default/banks/{bank_id}/memories` and `POST /v1/default/banks/{bank_id}/memories/recall`).*

### Start the FastAPI Backend
In a separate terminal:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at:
`http://127.0.0.1:8000/docs`

### Start the React Frontend (Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The application interface will be live at:
`http://localhost:5173/`

Frontend configuration is controlled via `frontend/.env`:
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## API Endpoints & Examples

### 1. Create a Project
* **POST** `/projects`
* **Request Body:**
```json
{
  "name": "Project Apollo",
  "description": "Next-generation memory augmented agent platform"
}
```
* **Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Project Apollo",
  "description": "Next-generation memory augmented agent platform",
  "created_at": "2026-09-29T12:00:00",
  "updated_at": "2026-09-29T12:00:00"
}
```

### 2. List All Projects
* **GET** `/projects`
* **Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Project Apollo",
      "description": "Next-generation memory augmented agent platform",
      "created_at": "2026-09-29T12:00:00",
      "updated_at": "2026-09-29T12:00:00"
    }
  ],
  "total": 1
}
```

### 3. Add Project Information (Store in Hindsight)
* **POST** `/projects/{project_id}/information`
* **Request Body:**
```json
{
  "title": "Database Selection Decision",
  "info_type": "decision",
  "content": "For Project Apollo, we decided to store relational metadata in MySQL and long-term project memories in Hindsight."
}
```
* **Response:** `201 Created`
```json
{
  "id": 1,
  "project_id": 1,
  "title": "Database Selection Decision",
  "info_type": "decision",
  "document_id": "doc_1_a1b2c3d4",
  "created_at": "2026-09-29T12:05:00",
  "hindsight_retained": true,
  "hindsight_bank_id": "project_1",
  "hindsight_operation_id": "op_987654321"
}
```

### 4. Get Project Information Metadata
* **GET** `/projects/{project_id}/information`
* **Response:** `200 OK`
```json
{
  "project_id": 1,
  "total": 1,
  "records": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Database Selection Decision",
      "info_type": "decision",
      "document_id": "doc_1_a1b2c3d4",
      "created_at": "2026-09-29T12:05:00"
    }
  ]
}
```

### 5. Recall Project Memories
* **GET** `/projects/{project_id}/memories?query=database`
* **Response:** `200 OK`
```json
{
  "project_id": 1,
  "bank_id": "project_1",
  "query": "database",
  "total_memories": 1,
  "memories": [
    {
      "id": "mem_001",
      "text": "For Project Apollo, we decided to store relational metadata in MySQL and long-term project memories in Hindsight.",
      "type": "fact",
      "entities": [],
      "context": null,
      "document_id": "doc_1_a1b2c3d4",
      "metadata": {
        "title": "Database Selection Decision",
        "info_type": "decision"
      }
    }
  ]
}
```

### 6. Process Project Information with AI (Extract & Retain Evolution)
* **POST** `/projects/{project_id}/process`
* **Description:** Analyzes raw project/meeting notes using Google Gemini (`gemini-2.5-flash`), extracts structured evolution facts (decisions, reasons, problems, changes, previous approaches, failed approaches, action items, deadlines, owners, unresolved questions), stores metadata in MySQL, and retains structured relational memory in Hindsight bank `project_<project_id>`.
* **Request Body:**
```json
{
  "content": "We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing. MongoDB caused data inconsistency in the payment module. We previously tried using two-phase commits with MongoDB, but it failed due to complexity. Alice will lead the migration by Friday. Bob will review the schema. We still don't know how to handle historical analytics data."
}
```
* **Response:** `200 OK`
```json
{
  "project_id": 1,
  "extracted_memories": {
    "decisions": [
      "We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing"
    ],
    "reasons": [
      "MongoDB lacked ACID transactions for billing",
      "complexity"
    ],
    "problems": [
      "MongoDB caused data inconsistency in the payment module"
    ],
    "changes": [
      "We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing",
      "Alice will lead the migration by Friday"
    ],
    "previous_approaches": [
      "We previously tried using two-phase commits with MongoDB, but it failed due to complexity"
    ],
    "failed_approaches": [
      "We previously tried using two-phase commits with MongoDB, but it failed due to complexity"
    ],
    "action_items": [
      "Alice will lead the migration by Friday",
      "Bob will review the schema"
    ],
    "deadlines": [
      "by Friday"
    ],
    "owners": [
      "Alice",
      "Bob"
    ],
    "unresolved_questions": [
      "We still don't know how to handle historical analytics data"
    ]
  },
  "stored": true
}
```

### 7. Historical Question Answering with Grounded Evidence
* **POST** `/projects/{project_id}/ask`
* **Description:** Receives a question about how and why a project evolved. Recalls the top relevant memories from Hindsight bank `project_<project_id>`, feeds them to Gemini AI reasoning agent, and returns a grounded answer backed by verifiable evidence from project history.
* **Flow:**
  ```
  User Question -> FastAPI -> Verify Project -> Hindsight Recall (top_k=5) -> Relevant Memories -> Gemini Reasoning -> Grounded Answer + Evidence
  ```
* **Request Body:**
```json
{
  "question": "Why did we switch from MongoDB to PostgreSQL?"
}
```
* **Response:** `200 OK`
```json
{
  "project_id": 1,
  "question": "Why did we switch from MongoDB to PostgreSQL?",
  "answer": "The team decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing and caused data inconsistency in the payment module. A previous attempt to use two-phase commits with MongoDB failed due to complexity.",
  "evidence": [
    {
      "memory": "Decision: We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing\nReason: MongoDB lacked ACID transactions for billing\nReason: complexity\n\nPrevious Approaches: We previously tried using two-phase commits with MongoDB, but it failed due to complexity\n\nProblems Encountered: MongoDB caused data inconsistency in the payment module\n\nChanges: We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing; Alice will lead the migration by Friday\n\nFailed Approaches: We previously tried using two-phase commits with MongoDB, but it failed due to complexity",
      "source": "ai_extraction",
      "relevance": "Documents the decision and reasons for switching from MongoDB to PostgreSQL.",
      "document_id": "ai_doc_1_c088d767",
      "memory_type": "project_evolution",
      "date": null
    }
  ],
  "confidence": "high"
}
```
* **Temporal & Meeting-Specific Grounding (Milestone 6):**
  * When a user question specifically targets a meeting or document (e.g. *"What happened in Meeting 1?"* or *"What was decided in Meeting 2?"*), retrieval and reasoning are **strictly restricted** to that meeting's memories.
  * Facts from other meetings (e.g. Meeting 2's PostgreSQL decision) are **never leaked** or substituted into Meeting 1 answers.
  * If a meeting does not contain requested facts (e.g. *"What did Meeting 1 say about PostgreSQL?"*), the system returns an honest refusal: `"Meeting 1 did not mention PostgreSQL."` with `confidence: "low"` and `evidence: []`.
  * For broad progression queries (e.g. *"Why did we eventually switch from MongoDB to PostgreSQL?"*), cross-meeting evolution synthesis is permitted and returns multi-meeting chronological evidence.

### 8. Delete Project
* **DELETE** `/projects/{project_id}`
* **Response:** `200 OK`
```json
{
  "project_id": 1,
  "message": "Project 1 ('Project Apollo') successfully deleted from MySQL.",
  "hindsight_retained": true,
  "note": "Project record and relational metadata deleted from MySQL. Hindsight memory bank remains preserved for historical audit."
}
```

---

## Running the Automated Test Suite

We provide a comprehensive pytest test suite covering all 33 integration tests across Milestones 1 through 6:
```bash
pytest -v tests/test_backend.py
```

The test suite validates:
1. Multi-project CRUD and project isolation.
2. Direct Hindsight long-term memory retention and recall scoping (`project_<id>`).
3. Cross-project memory privacy (Beta cannot access Alpha memories).
4. Relational MySQL storage separation (zero raw memory duplicated in MySQL).
5. AI memory extraction endpoint `POST /projects/{project_id}/process` with structured schema enforcement.
6. Hindsight recall of relational evolution facts (decisions, reasons, problems, changes, failed approaches).
7. Historical Question Answering endpoint `POST /projects/{project_id}/ask` with grounded evidence.
8. Anti-hallucination behavior for unknown authors/unrecorded topics.
9. Mandatory Project A vs Project B isolation verification on question answering.
10. Robust error handling (404 for nonexistent projects, 422 for empty questions).
11. Relational database cascading on project deletion.
12. **Milestone 6 Temporal & Meeting Grounding (Tests 27–33):**
    * Preserving explicit document and meeting identifiers (`meeting_001`, `meeting_002`, titles).
    * Meeting 1 query answered strictly with Meeting 1 facts, never leaking Meeting 2 facts.
    * Meeting 2 query answered with Meeting 2 PostgreSQL decision and migration owner.
    * Honest refusal with low confidence and empty evidence when asked what Meeting 1 said about PostgreSQL.
    * Multi-meeting synthesis for project evolution question (*"Why did we switch from MongoDB to PostgreSQL?"*).
    * Honest refusal for nonexistent meeting (*"What was decided in Meeting 5?"*).
    * Honest refusal for unrecorded topic (*"Who approved the AWS migration?"*).

You can also run the self-contained demonstration flow:
```bash
python scripts/demo_flow.py
```

And test the complete end-to-end frontend integration & isolation flow:
```bash
python scripts/verify_frontend_flow.py
```
*(All scripts connect to the running FastAPI server and MySQL database, confirming zero memory duplication, end-to-end frontend compatibility, and absolute project isolation).*
