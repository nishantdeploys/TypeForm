# 🚀 Typeform Clone - Conversational Form Platform & Multi-Tenant SaaS

A production-grade, full-stack multi-tenant form builder and conversational survey application. Built to replicate Typeform's signature design aesthetic, fluid one-question-at-a-time respondent experience, interactive drag-and-drop studio, role-based multi-tenant data isolation, and Google OAuth 2.0 integration.

---

## 🌐 Live Production Deployment

- **Live Application**: [https://typeform.tech](https://typeform.tech) *(and [https://www.typeform.tech](https://www.typeform.tech))*
- **Cloud Infrastructure**: AWS EC2 (Ubuntu 22.04 LTS) with Elastic IP (`3.111.96.34`)
- **Reverse Proxy & SSL**: Nginx Reverse Proxy with Certbot Let's Encrypt SSL/HTTPS Encryption
- **Process Manager**: PM2 Process Manager (`ecosystem.config.js`)

---

## 🔑 Demo Access Credentials

The database is pre-seeded with two distinct user accounts to demonstrate multi-tenant data isolation and creator analytics:

| User | Email | Password | Seeded Forms |
| :--- | :--- | :--- | :--- |
| **Nishant** | `nishant@example.com` | `password123` | • *Customer Feedback Form* (Published, 3 Responses)<br>• *Employee Experience Survey* (Draft) |
| **Ayush** | `ayush@example.com` | `password123` | • *Product Survey* (Published, 2 Responses)<br>• *Event Feedback* (Published) |

*(You can also sign in via **"Continue with Google"** on the `/login` screen to test official Google OAuth 2.0 authentication).*

---

## 📐 System Architecture Diagram

```text
                               +-------------------------------------------------+
                               |           Client Web Browser (HTTPS)            |
                               |      https://typeform.tech / www.typeform.tech  |
                               +-------------------------------------------------+
                                                       |
                                                       v
┌──────────────────────────────────────── AWS EC2 INSTANCE (3.111.96.34) ────────────────────────────────────────┐
│                                                                                                                │
│                                       🛡️ Nginx Reverse Proxy (Port 80/443 SSL)                                 │
│                                       ├── / (UI Routes)   ──> Next.js Server (Port 3000)                        │
│                                       └── /api/* (API)    ──> FastAPI Uvicorn (Port 8000)                      │
│                                                                                                                │
│                 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐          │
│                 |         ⚡ Next.js 16 Frontend        |     |         🐍 FastAPI Backend           |          │
│                 |  App Router, TypeScript, Tailwind,   |     |   Routes -> Services -> Security     |          │
│                 |  Framer Motion, @dnd-kit Studio UI   |     |   JWT Auth & Multi-Tenant IDOR Guard |          │
│                 └──────────────────────────────────────┘     └──────────────────────────────────────┘          │
│                                                                                 |                              │
│                                                                       (SQLAlchemy 2.0 ORM)                     │
│                                                                                 |                              │
│                                                                                 v                              │
│                                                              ┌──────────────────────────────────────┐          │
│                                                              |          💾 SQLite Database          |          │
│                                                              |     (users, forms, questions, etc.)   |          │
│                                                              └──────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Multi-Tenant Ownership & Security Flow

```text
  [ User (e.g., Ayush) ]
            │
            │  1. Requests /forms/{nishant_form_id}/builder
            ▼
  ┌───────────────────┐
  │  Next.js Frontend │
  └───────────────────┘
            │
            │  2. GET /api/forms/{nishant_form_id}  (Authorization: Bearer <Ayush_JWT_Token>)
            ▼
  ┌───────────────────┐
  │  FastAPI Backend  │ ──► 3. Decodes JWT & extracts `current_user.id` (Ayush.id)
  └───────────────────┘
            │
            │  4. Queries DB for Form where id = {nishant_form_id}
            ▼
  ┌───────────────────┐
  │  SQLite Database  │ ──► 5. Returns Form (owner_id = Nishant.id)
  └───────────────────┘
            │
            │  6. Security Verification: Is `form.owner_id == current_user.id`?
            ├─────────────────────────────────────────┐
            │ NO (Ownership Mismatch / IDOR Attempt)  │ YES (Authorized Owner)
            ▼                                         ▼
   HTTP 404 Not Found                       HTTP 200 OK
   (Prevents form existence leakage)        (Loads Form Data & Builder)
            │
            ▼
   Renders Clean "Form Unavailable" Card
```

---

## 🌟 Executive Core Capabilities

### 1. Multi-Tenant User Isolation & IDOR Security
- **Explicit Relational Ownership**: Every form is linked to an `owner_id` (foreign key referencing `users.id`).
- **Dashboard Isolation**: `/forms` queries and returns strictly the forms owned by `current_user.id`.
- **Backend IDOR Protection**: Admin and creator APIs (`/builder`, `/responses`, `/statistics`, question CRUD, publish, duplicate, delete) verify ownership server-side and return `404 Not Found` for unauthorized access attempts.

### 2. Interactive Form Builder Studio (`/forms/[id]/builder`)
- **3-Column Studio Layout**: Left question outline navigator, center interactive canvas, and right contextual settings inspector.
- **Drag-and-Drop Question Reordering**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable` with real-time position persistence in SQLite.
- **8 Supported Question Types**: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, and `rating`.
- **Live Studio Controls**: Real-time title editing, auto-save status indicator, preview mode toggle, publish/unpublish action, and public shareable URL generator.

### 3. Signature Typeform Conversational Respondent Experience (`/f/[slug]`)
- **One Question at a Time**: Fullscreen minimalist interface with crisp typography and subtle micro-animations.
- **Fluid Motion Transitions**: Powered by `Framer Motion` with directional vertical slide and fade transitions.
- **Keyboard Navigation**: Advance with `Enter ↵`, navigate backward with `ArrowUp` / `Shift+Enter`, and select choice options directly via keyboard.
- **Validation Engine**: Real-time required field checks, regex email syntax validation, numeric constraint enforcement, and error alerts.
- **Zero Authentication Required**: Open shareable public URLs accessible by anyone without login.

### 4. Results & Creator Analytics (`/forms/[id]/responses`)
- **Executive Metrics**: Total Submissions, Average Completion Time (seconds), and Completion Rate.
- **Per-Question Analytics**: Interactive rating scale averages, choice distribution progress bars, and recent text response samples.
- **Submissions Data Table**: Searchable table displaying submission timestamps, time taken, preview of answers, and CSV export functionality.
- **Individual Answer Transcripts**: Modal viewer rendering submission entries formatted like clean interview transcripts.

---

## 🗄️ Database Schema (Entity Relationship Diagram)

```text
+------------------+         +-------------------+         +------------------------+
|      users       |         |       forms       |         |       questions        |
+------------------+         +-------------------+         +------------------------+
| id (PK, UUID)    |<-------1| id (PK, UUID)     |<-------1| id (PK, UUID)          |
| email (UNIQUE)   |         | title             |         | form_id (FK)           |
| hashed_password  |         | description       |         | type                   |
| full_name        |         | slug (UNIQUE)     |         | title                  |
| avatar_url       |         | status            |         | description            |
| created_at       |         | owner_id (FK)     |         | required               |
+------------------+         | created_at        |         | position               |
                             +-------------------+         | settings_json          |
                                      |                    +------------------------+
                                      |1                               |
                                      v                                |1
                             +-------------------+                     v
                             |     responses     |         +------------------------+
                             +-------------------+         |    question_options    |
                             | id (PK, UUID)     |<-------1|------------------------|
                             | form_id (FK)      |         | id (PK, UUID)          |
                             | submitted_at      |         | question_id (FK)       |
                             | completion_time   |         | label                  |
                             | metadata_json     |         | value                  |
                             +-------------------+         | position               |
                                      |                    +------------------------+
                                      |1
                                      v
                             +-------------------+
                             | response_answers  |
                             +-------------------+
                             | id (PK, UUID)     |
                             | response_id (FK)  |
                             | question_id (FK)  |
                             | answer_text       |
                             | answer_number     |
                             | answer_json       |
                             +-------------------+
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router), React 19, TypeScript | Server and client component rendering, route protection |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide Icons | Ultra-clean minimalist SaaS aesthetic & smooth transitions |
| **Drag-and-Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Accessible question reordering in builder studio |
| **Backend Framework**| FastAPI (Python 3.11), Pydantic v2 | High-performance REST API, request schema validation |
| **Security & Auth** | JWT (`pyjwt`), Passlib (`bcrypt`), Google OAuth 2.0 | User authentication and multi-tenant authorization |
| **ORM & Database** | SQLAlchemy 2.0, SQLite (`typeform.db`) | Relational persistence, query optimization, cascades |
| **Web Server & Proxy**| Nginx, Certbot SSL, PM2 | Reverse proxying, automated HTTPS, 24/7 uptime |

---

## 📡 REST API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate email/password & receive JWT token |
| `POST` | `/api/auth/google` | Public | Authenticate/Register via Google OAuth 2.0 |
| `GET` | `/api/auth/me` | Bearer Token | Retrieve authenticated user profile |
| `GET` | `/api/forms` | Bearer Token | List authenticated user's owned forms only |
| `POST` | `/api/forms` | Bearer Token | Create a new form (sets `owner_id = current_user.id`) |
| `GET` | `/api/forms/{id}` | Bearer Token | Get form details (Owner-only check) |
| `PATCH` | `/api/forms/{id}` | Bearer Token | Update form metadata or status (Owner-only) |
| `DELETE` | `/api/forms/{id}` | Bearer Token | Delete form and cascade related records (Owner-only) |
| `POST` | `/api/forms/{id}/duplicate` | Bearer Token | Duplicate form & questions into draft (Owner-only) |
| `POST` | `/api/forms/{id}/publish` | Bearer Token | Publish form (Owner-only) |
| `POST` | `/api/forms/{id}/unpublish` | Bearer Token | Unpublish form (Owner-only) |
| `POST` | `/api/forms/{id}/questions` | Bearer Token | Add a question to form (Owner-only) |
| `PATCH` | `/api/questions/{id}` | Bearer Token | Update question properties or options (Owner-only) |
| `DELETE` | `/api/questions/{id}` | Bearer Token | Delete a question (Owner-only) |
| `POST` | `/api/forms/{id}/questions/reorder` | Bearer Token | Reorder questions via drag-and-drop (Owner-only) |
| `GET` | `/api/forms/{id}/responses` | Bearer Token | List submitted responses for a form (Owner-only) |
| `GET` | `/api/forms/{id}/responses/{res_id}` | Bearer Token | Get individual submission transcript (Owner-only) |
| `GET` | `/api/forms/{id}/statistics` | Bearer Token | Fetch computed analytics summary (Owner-only) |
| `GET` | `/api/public/forms/{slug}` | Public | Public fetch for published form structure |
| `POST` | `/api/public/forms/{slug}/responses` | Public | Submit public form response with validation |

---

## 🧪 Testing & Verification

### Pytest Backend Suite (8/8 Passed in 2.12s)
```bash
cd backend
.venv\Scripts\pytest
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.11.4, pytest-8.4.2
collected 8 items

tests\test_auth.py ...                                                   [ 37%]
tests\test_forms.py ...                                                  [ 75%]
tests\test_questions.py .                                                [ 87%]
tests\test_responses.py .                                                [100%]

======================== 8 passed in 2.12s ========================
```

---

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seeds/seed.py
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
