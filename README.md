# BloodLink — Digital Blood Donation Emergency Network

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue.svg)](apps/web)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-FastAPI%20%7C%20scikit--learn-green.svg)](ai-service)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](supabase)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%26%20Pytest%20Passing-brightgreen.svg)](apps/web/src/tests)

**BloodLink** is a mission-critical digital blood emergency network designed to connect voluntary blood donors, patients/caregivers, verified hospitals, accredited blood banks, and platform administrators.

It combines **real-time emergency triage**, **explainable clinical compatibility AI matching**, **atomic inventory reservation**, **AI time-series demand forecasting**, and **in-app notification workflows** into a modern healthcare SaaS application.

---

## 🌟 Key Features & Public Pages

1. **Public Emergency Portal**:
   - **Landing Page (`/`)**: Hero section with quick emergency blood search, live hospital alerts ticker, operational metrics, how it works, and FAQs.
   - **Emergency Search & Interactive Map (`/find-blood`)**: Filter by blood group, component, city, and radius with Leaflet + OpenStreetMap and list views.
   - **Verified Blood Banks Directory (`/blood-banks`)**: Public verified facility registry with licenses, hours, and contact dispatch numbers.
   - **AI Demand Forecasting Dashboard (`/forecast`)**: Time-series demand projection charts with statistical confidence bands, rolling-average baseline comparisons, and shortage deficit warnings.
   - **Educational Guidelines (`/how-it-works` & `/about`)**: Transfusion compatibility matrices, biological recovery intervals, and clinical safeguards.
   - **Support & Incident Reporting (`/contact`)**: Zod-validated report desk.

2. **Role-Specific Portals & Workflows**:
   - **Donor Portal (`/donor/dashboard`, `/donor/invitations`, `/donor/history`, `/donor/profile`)**:
     - Real-time emergency outreach notifications with distance and explainable match scores.
     - Working **Accept** and **Decline** buttons that instantly update the database, log donor response, and notify hospital triage.
     - Live availability toggle and consented travel radius controls.
     - Donation history, milestone reward badges, and eligibility cooldown tracking.
   - **Patient / Requester Portal (`/patient/dashboard`, `/patient/new-request`, `/patient/requests/:id`)**:
     - Validated emergency requisition order submission.
     - Real-time pipeline status tracker: `submitted` → `pending_verification` → `matching` → `donor_response_received` → `fulfilled`.
     - Privacy shield: Tracks donor responses without leaking private donor identities or coordinates.
   - **Hospital Staff Portal (`/hospital/dashboard`, `/hospital/requests`, `/hospital/requests/:id`, `/hospital/inventory`, `/hospital/donors`)**:
     - Clinical verification and rejection triage with mandatory audit reasons.
     - **Explainable AI Matching**: Transparent candidate ranking (Compatibility 40%, Proximity 30%, Recovery Interval 20%, Reliability 10%).
     - **Batch Outreach Broadcast**: 1-click dispatch to compatible candidates.
     - **Atomic Blood Stock Allocation**: Reserves units from hospital batches with concurrency protection.
   - **Blood Bank Staff Portal (`/blood-bank/dashboard`, `/blood-bank/inventory`, `/blood-bank/transactions`)**:
     - Separate tracking for blood groups and individual blood components (Red Blood Cells, Platelets, Whole Blood, Fresh Frozen Plasma, Cryoprecipitate).
     - Batch-level accessioning, shelf life/expiry tracking, quality status adjustments (`available`, `quarantined`, `discarded`).
     - Cryptographically auditable stock transaction ledger.
   - **Platform Admin Suite (`/admin/dashboard`, `/admin/organizations`, `/admin/audit-logs`)**:
     - Medical license verification desk to approve, reject, or suspend healthcare facilities.
     - Full audit logs of sensitive clinical and administrative operations.

---

## ⚡ Instant Sandbox Demo Mode

BloodLink runs **100% out of the box** in a zero-config demo mode with realistic synthetic data!
Use the **top bar sandbox switcher** or demo sign-in buttons on `/auth/login` to instantly experience any role:

- **Donor**: Marcus Chen (`donor@bloodlink.demo`) — Universal O- Donor (12 prior donations)
- **Patient / Requester**: Priya Patel (`patient@bloodlink.demo`)
- **Hospital Staff**: Dr. Rajesh Rao (`hospital@bloodlink.demo`) — Lead Trauma Surgeon
- **Blood Bank Staff**: Elena Rostova (`bloodbank@bloodlink.demo`) — Blood Bank Director
- **Platform Admin**: Dr. Sarah Mitchell (`admin@bloodlink.demo`) — Platform Administrator

---

## 📁 Repository Structure

```
├── apps/
│   └── web/                     # React 19 + Vite + TypeScript Frontend
│       ├── src/
│       │   ├── components/      # Common UI (Navbar, Footer, Badge, Card, Modal, Map)
│       │   ├── context/         # AuthContext & NotificationContext
│       │   ├── lib/             # Supabase client, storage, AI client, clinical rules
│       │   ├── pages/           # Public pages & role-specific dashboards
│       │   ├── tests/           # Vitest unit test suite
│       │   └── types/           # Domain models & TypeScript interfaces
│       ├── index.html           # SEO-optimized markup with Inter font & Leaflet CSS
│       └── tailwind.config.js   # Healthcare SaaS design tokens
│
├── ai-service/                  # Python FastAPI + scikit-learn Service
│   ├── app/
│   │   ├── main.py              # FastAPI app with CORS and REST endpoints
│   │   └── models/
│   │       ├── matching.py      # Explainable clinical donor ranking pipeline
│   │       └── forecaster.py    # Ridge regression time-series demand forecaster
│   ├── tests/                   # Pytest automated test suite
│   └── requirements.txt
│
├── supabase/
│   ├── migrations/              # PostgreSQL schema, RLS policies, atomic functions
│   │   └── 20261001000000_initial_schema.sql
│   ├── functions/               # Supabase Edge Functions (Deno / TypeScript)
│   │   ├── match-donors/
│   │   ├── reserve-stock/
│   │   └── send-notification/
│   └── seed.sql                 # Synthetic seed data for testing
│
└── docs/                        # Architecture, API, and Security Documentation
    ├── ARCHITECTURE.md
    ├── API.md
    └── SECURITY.md
```

---

## 🚀 Quickstart Guide

### 1. Run the Web Application
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To run the frontend test suite:
```bash
npm test
# or
npx vitest run
```

To build for production:
```bash
npm run build
```

### 2. Run the AI Service (Optional — Frontend includes automatic fallback)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger documentation.

To run the AI service test suite:
```bash
python -m pytest tests/test_ai_service.py
```

### 3. Database Setup (Supabase)
To apply the database schema to your Supabase project:
1. Run the migration in `supabase/migrations/20261001000000_initial_schema.sql` via the Supabase SQL Editor.
2. Seed the database using `supabase/seed.sql`.
3. Configure `apps/web/.env` with your project URL and public Anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_AI_SERVICE_URL=http://localhost:8000
   ```

---

## 🔒 Clinical Safety & Privacy Principles

1. **Non-Overridable Clinical Compatibility**: ABO and Rh transfusion safety rules are enforced as hard filters. Software never overrides clinical incompatibility.
2. **Mandatory On-Site Medical Screening**: Donor software eligibility calculations represent minimum biological recovery windows (e.g. 56 days for Whole Blood). Every donor is screened by qualified personnel prior to collection.
3. **No Residential Address Leakage**: Donors are matched using approximate radius centroids. Exact home coordinates are never published on any public feed or map.
4. **Race-Condition-Proof Reservations**: Inventory reservation utilizes PostgreSQL `SELECT ... FOR UPDATE` locks within `reserve_stock_atomic` to eliminate duplicate reservations.

---

## 📄 License
MIT License. Created for the BloodLink Emergency Network.
