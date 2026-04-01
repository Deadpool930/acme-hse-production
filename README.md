# ACME Solar EHS Management System

A premium, enterprise-grade Environment, Health, and Safety (EHS) system built with FastAPI and React.

## 🚀 Technology Stack

- **Backend**: FastAPI (Python 3.10+)
- **Database**: MySQL 8.0 with SQLAlchemy (Async)
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Design**: Material Glassmorphism (Premium Design System)
- **Monitoring**: SLA Escalation Engine + ISO Audit Trail

## 📂 Project Structure

```text
achme/
├── backend/app/        # Modular FastAPI application
│   ├── api/            # Route handlers (Auth, Events, Dashboard, Master)
│   ├── models.py       # SQLAlchemy database models
│   ├── schemas.py      # Pydantic data validation
│   ├── services/       # Core business logic (Audit, Escalation)
│   └── database.py     # Async session management
├── frontend/src/       # React TSX application
│   ├── components/ui/  # Reusable Glass UI components
│   ├── api/            # Axios API clients
│   └── service-worker.ts # Offline sync and caching
└── task.md             # Development roadmap
```

## 🛠️ Performance Features

1. **Enterprise Audit Trail**: Every change is tracked with old/new values.
2. **SLA Escalation**: Automatic monitoring of high-risk incidents.
3. **Offline Resilience**: Service worker prepared for background synchronization.
4. **Precision GPS**: Telemetry capture for site validation.

## 🏁 Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python -m app.main`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
*Authorized Personnel Only • ACME Solar Holdings*
