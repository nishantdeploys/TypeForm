# Typeform Clone - Conversational Form Platform

A full-stack implementation of the Typeform application built for an SDE Fullstack Assignment. This platform replicates Typeform's signature design aesthetic, user experience, interactive drag-and-drop form-building studio, and polished one-question-at-a-time conversational respondent flow.

---

## 🌟 Executive Summary & Features

### 1. Interactive Form Builder Studio (`/forms/[id]/builder`)
- **3-Column Studio Layout**: Left question outline panel, center canvas, and right contextual settings inspector.
- **Drag-and-Drop Question Reordering**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable` with position persistence in SQLite.
- **8 Supported Question Types**:
  1. `short_text` — Single line text input.
  2. `long_text` — Multi-line textarea for detailed feedback.
  3. `multiple_choice` — Selectable choice buttons with option reordering & custom labels.
  4. `dropdown` — Clean select menu.
  5. `email` — Validated email address input.
  6. `number` — Validated numeric input.
  7. `yes_no` — Binary toggle buttons with keyboard shortcuts (`Y`/`N`).
  8. `rating` — Interactive rating scale (1-5, 1-10) with custom min/max labels.
- **Per-Question Settings**: Title, description/help text, required toggle, option list manager, and type-specific configurations.
- **Live Header Controls**: Inline title editing, auto-save status indicator, preview switch, publish/unpublish toggle, and public shareable URL copy.

### 2. Form Management & CRUD (`/forms`)
- **Creator Dashboard**: View all creator forms with status badges (`Draft` / `Published`), question counts, and response counts.
- **Full Form Operations**: Create new forms, rename inline, duplicate (deep-cloning questions & options into a draft), and delete with safety confirmation modals.
- **Publishing Workflow**: One-click publish generating a unique public slug (e.g. `/f/customer-feedback-survey`). Unpublishing restricts public fill access immediately.

### 3. Signature Typeform Respondent Flow (`/f/[slug]`)
- **One Question at a Time**: Fullscreen minimal layout with high contrast typography and minimal chrome.
- **Smooth Motion Transitions**: Powered by `Framer Motion` with vertical slide and fade transitions between questions.
- **Keyboard Navigation**: Advance with `Enter ↵`, navigate backward with `ArrowUp` / `Shift+Enter`, and select choice options directly.
- **Progress Bar Indicator**: Real-time progress fraction (`Question 3 of 8`) and progress bar.
- **Client & Server Validation**: Instant required field warnings, regex email syntax checks, numeric enforcement, and choice validation.
- **Thank You Screen**: Polished submission confirmation with total time calculation and optional restart button.
- **Zero Authentication Required**: Open shareable public link accessible by anyone.

### 4. Results & Analytics Dashboard (`/forms/[id]/responses`)
- **Summary Metrics**: Total Submissions, Average Completion Time (seconds), and 100% Completion Rate.
- **Per-Question Breakdown**: Rating scale averages, choice distribution percentage progress bars, and recent text response samples.
- **Submissions Data Table**: Searchable table displaying submission timestamp, time taken, preview of answers, and CSV export functionality.
- **Individual Submission Transcript**: Modal viewer showing every submitted answer formatted like a clean interview transcript.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11 with FastAPI
- **Validation**: Pydantic v2 (ConfigDict schemas)
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (`typeform.db`)
- **Testing**: Pytest & HTTPX TestClient

---

## 📐 System Architecture

```
                          +------------------------------------------+
                          |            Next.js Frontend              |
                          |  App Router, TypeScript, Tailwind, DND   |
                          +------------------------------------------+
                                    |                      |
                    (Creator Admin API)            (Public Respondent Fill API)
                                    |                      |
                                    v                      v
                          +------------------------------------------+
                          |             FastAPI Backend              |
                          |   Routes -> Services -> Repositories     |
                          +------------------------------------------+
                                               |
                                     (SQLAlchemy 2.0 ORM)
                                               |
                                               v
                          +------------------------------------------+
                          |             SQLite Database              |
                          | (forms, questions, options, responses)   |
                          +------------------------------------------+
```

---

## 🗄 Database Schema

The database uses a normalized relational structure stored in `backend/typeform.db`:

```
+------------------+         +-------------------+         +------------------------+
|      forms       |         |     questions     |         |    question_options    |
+------------------+         +-------------------+         +------------------------+
| id (PK, UUID)    |<-------1| id (PK, UUID)     |<-------1| id (PK, UUID)          |
| title            |         | form_id (FK)      |         | question_id (FK)       |
| description      |         | type              |         | label                  |
| slug (UNIQUE)    |         | title             |         | value                  |
| status           |         | description       |         | position               |
| created_at       |         | required          |         +------------------------+
| updated_at       |         | position          |
| published_at     |         | settings_json     |
+------------------+         +-------------------+
         |                             |
         |1                            |1
         v                             v
+------------------+         +-------------------+
|    responses     |         | response_answers  |
+------------------+         +-------------------+
| id (PK, UUID)    |<-------1| id (PK, UUID)     |
| form_id (FK)     |         | response_id (FK)  |
| submitted_at     |         | question_id (FK)  |
| completion_time  |         | answer_text       |
| metadata_json    |         | answer_number     |
+------------------+         | answer_json       |
                             +-------------------+
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/forms` | List creator forms with question & response counts |
| `POST` | `/api/forms` | Create a new form |
| `GET` | `/api/forms/{id}` | Get form details with questions & options |
| `PATCH` | `/api/forms/{id}` | Update form metadata or status |
| `DELETE` | `/api/forms/{id}` | Delete form and cascade related records |
| `POST` | `/api/forms/{id}/duplicate` | Duplicate form, questions, and options into draft |
| `POST` | `/api/forms/{id}/publish` | Publish form (validates questions exist) |
| `POST` | `/api/forms/{id}/unpublish` | Unpublish form |
| `POST` | `/api/forms/{id}/questions` | Add a new question to a form |
| `PATCH` | `/api/questions/{id}` | Update question properties or options |
| `DELETE` | `/api/questions/{id}` | Delete a question |
| `POST` | `/api/forms/{id}/questions/reorder` | Update question positions via drag-and-drop |
| `GET` | `/api/forms/{id}/responses` | List all submitted responses for a form |
| `GET` | `/api/forms/{id}/responses/{response_id}` | Get individual submission answer transcript |
| `GET` | `/api/forms/{id}/statistics` | Fetch computed question analytics summary |
| `GET` | `/api/public/forms/{slug}` | Public fetch for published form structure |
| `POST` | `/api/public/forms/{slug}/responses` | Submit public form response with validation |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+ and npm
- Python 3.11+

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
py -m venv .venv

# Activate virtual environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Seed database with sample forms and responses
python seeds/seed.py

# Run backend API server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`  
API Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev -- -p 3000
```
Frontend App will be running at: `http://localhost:3000`

---

## 🧪 Testing & Verification

### Running Backend Pytest Suite
```bash
cd backend
.venv\Scripts\pytest
```
Expected output:
```text
tests/test_forms.py ...
tests/test_questions.py .
tests/test_responses.py .
5 passed in 1.36s
```

### Running Frontend Production Build
```bash
cd frontend
npm run build
```
Expected output:
```text
✓ Compiled successfully
✓ Finalizing page optimization
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /f/[slug]
├ ○ /forms
├ ƒ /forms/[id]/builder
├ ƒ /forms/[id]/preview
└ ƒ /forms/[id]/responses
```

---

## 🎯 Evaluation & Implementation Decisions

1. **Why SQLite & Normalized Relational Schema?**  
   Storing forms as monolithic JSON blobs prevents relational analytics and querying. A normalized model (`forms` -> `questions` -> `question_options` & `responses` -> `response_answers`) enables fast per-question aggregations, SQL indexes, and clean data integrity.

2. **Why `@dnd-kit` for Drag and Drop?**  
   `@dnd-kit` provides accessible, lightweight drag-and-drop primitives optimized for React and Next.js App Router without inline style hacks or heavy DOM mutations.

3. **How is the Conversational Respondent Flow Implemented?**  
   Using a centralized `RespondentLayout` component wrapped around `Framer Motion`'s `AnimatePresence`. Each question receives vertical motion direction (`direction = 1` for next, `-1` for back), creating Typeform's signature fluid transitions.

4. **How are Keyboard Shortcuts Handled?**  
   Global event listeners trap `Enter` and arrow keys (`ArrowUp`/`ArrowDown`), advancing the active question index seamlessly after triggering client-side validation.
