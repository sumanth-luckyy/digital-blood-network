# BloodLink — Security & Privacy Architecture

## Security Guarantees & Clinical Safeguards

### 1. Medical Non-Override Policy
- Algorithms and AI models **NEVER** override clinical incompatibility. Incompatible donor groups are rejected at the hard filter stage.
- Software eligibility calculations reflect minimum biological intervals (e.g. 56 days for Whole Blood) but do not replace on-site screening by licensed medical professionals.

### 2. Donor Geographic Privacy
- **No Exact Home Address Exposure**: Donors consent to approximate geographic search radiuses (e.g. 15–25 km). Public feeds or maps never pinpoint individual donor residences.
- Public search maps display only verified institutional facilities (hospitals and blood banks).

### 3. Verification Safeguards
- Public users cannot self-assign administrator privileges or self-verify healthcare organizations.
- Organization approval requires explicit review of state medical license numbers by administrators with mandatory audit reasons logged in `audit_logs`.
- Emergency requests must be reviewed by verified hospital staff before mass donor broadcasts can be triggered.

### 4. Database Concurrency & Integrity
- All inventory reservations execute with PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) in `reserve_stock_atomic` to eliminate race conditions and negative inventory.
- Row-Level Security (RLS) policies restrict reads/updates strictly to authenticated owners, organization staff, or administrators.

### 5. Secret Hygiene
- All client-side code interacts strictly with public anon keys via `VITE_` variables.
- Service-role keys and database credentials remain exclusively on the server in edge functions or container environments.
