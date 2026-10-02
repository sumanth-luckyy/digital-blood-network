# BloodLink — System Architecture Document

## Overview
**BloodLink** is a mission-critical digital blood donation emergency network engineered to coordinate voluntary blood donors, patients/caregivers, verified hospitals, accredited blood banks, and platform administrators.

```
                      +---------------------------------------+
                      |         React + Vite Frontend         |
                      |  (Tailwind CSS, Lucide, Leaflet maps) |
                      +-------------------+-------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
          +-----------------------------+     +-----------------------------+
          |     Supabase PostgreSQL     |     |   Python FastAPI Engine     |
          |  - Auth & Row Level Security|     |  - Clinical ABO/Rh filters  |
          |  - Atomic Stored Procedures |     |  - Explainable Donor Ranker |
          |  - Edge Functions           |     |  - Ridge Time-Series Demand |
          |  - Audit & Notification Logs|     |    Forecaster (scikit-learn)|
          +-----------------------------+     +-----------------------------+
```

## Component Architecture

### 1. Web Application (`apps/web`)
- **Framework**: React 19 + TypeScript + Vite.
- **Styling & Design System**: Tailwind CSS v4 with bespoke healthcare SaaS tokens:
  - Deep Medical Red: `#C62828`
  - Dark Navy: `#17233C`
  - Canvas Background: `#F8FAFC`
  - Emergency, warning, and verification semantics.
- **Routing**: React Router with protected role dashboards and public accessibility.
- **Data & Forms**: React Hook Form + Zod schema validation; TanStack Query for caching.
- **Mapping**: Leaflet + OpenStreetMap with custom map markers for hospitals, blood banks, and approximate request zones.
- **Charts**: Recharts time-series projections with confidence bands.
- **Sandbox Demo Mode**: Instant role switcher with persistent LocalStorage state.

### 2. Database & Security Layer (`supabase/`)
- **PostgreSQL 15+** with version-controlled migrations:
  - `profiles`, `donor_profiles`, `organizations`, `organization_members`
  - `blood_requests`, `blood_request_events`, `donor_matches`
  - `blood_stock_batches`, `blood_stock_transactions`, `donations`
  - `notifications`, `demand_forecasts`, `audit_logs`, `support_reports`
- **Atomic Concurrency Protection**:
  - `reserve_stock_atomic`: Locks batch row with `FOR UPDATE` to guarantee zero negative inventory and double-allocation.
  - `release_stock_atomic`: Atomically releases reserved units back into usable pool.
- **Row-Level Security (RLS)**: Enforces least-privilege access across all exposed tables.

### 3. AI Service (`ai-service/`)
- **FastAPI Backend**:
  - `POST /api/v1/matching/rank-donors`: Clinical compatibility matrix + Haversine proximity + interval cooldown checks + transparent score breakdown.
  - `POST /api/v1/forecast/demand`: Ridge regression with 7-day rolling baseline fallback and inventory deficit alerting.
  - Automated tests via `pytest`.
