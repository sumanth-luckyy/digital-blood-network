# BloodLink — API Specification

## AI Service Endpoints (FastAPI)

Base URL: `http://localhost:8000`

### 1. Health Status
- **Method**: `GET /health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "BloodLink AI Engine",
  "version": "1.0.0",
  "models_ready": true
}
```

### 2. Explainable Donor Candidate Ranking
- **Method**: `POST /api/v1/matching/rank-donors`
- **Request Body**:
```json
{
  "request": {
    "blood_group": "A+",
    "blood_component": "Red Blood Cells",
    "units_needed": 2,
    "urgency": "critical",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "donors": [
    {
      "id": "donor-1",
      "blood_group": "O-",
      "latitude": 40.7150,
      "longitude": -74.0020,
      "travel_radius_km": 25,
      "is_available": true,
      "consent_emergency_alerts": true,
      "total_donations": 12,
      "last_donation_date": "2026-06-15"
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "request_blood_group": "A+",
  "blood_component": "Red Blood Cells",
  "total_candidates_evaluated": 1,
  "qualified_donors_count": 1,
  "ranked_donors": [
    {
      "donor_id": "donor-1",
      "blood_group": "O-",
      "distance_km": 0.42,
      "match_score": 96.5,
      "reasons": [
        { "factor": "Clinical Compatibility", "points": 35.0, "details": "Universal RBC donor" },
        { "factor": "Proximity", "points": 29.5, "details": "Distance ~0.42 km" },
        { "factor": "Interval Eligibility", "points": 20.0, "details": "Passed cooldown window" },
        { "factor": "History & Experience", "points": 10.0, "details": "12 verified prior donations" }
      ]
    }
  ]
}
```

### 3. Blood Demand Time-Series Forecasting
- **Method**: `POST /api/v1/forecast/demand`
- **Request Body**:
```json
{
  "blood_group": "O-",
  "blood_component": "Red Blood Cells",
  "forecast_horizon_days": 7,
  "current_available_stock": 4
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "blood_group": "O-",
    "blood_component": "Red Blood Cells",
    "forecast_horizon_days": 7,
    "model_version": "Ridge-TimeSeries-v1.2",
    "model_mae": 0.84,
    "baseline_rolling_mae": 1.15,
    "total_projected_demand": 14.8,
    "current_available_stock": 4,
    "stock_gap": -10.8,
    "shortage_risk": "high",
    "shortage_warning": "Potential shortage detected: Projected demand exceeds usable stock by ~10.8 units.",
    "forecast_points": [
      { "date": "2026-10-02", "day": "Fri", "predicted_units": 2.1, "lower_bound": 0.8, "upper_bound": 3.4 }
    ]
  }
}
```

## Supabase Stored Procedures (RPC)

### 1. `reserve_stock_atomic`
- **Parameters**: `p_batch_id UUID`, `p_units INT`, `p_request_id UUID`, `p_user_id UUID`
- **Returns**: `JSONB` with transaction status, reserved units, and updated balances.

### 2. `release_stock_atomic`
- **Parameters**: `p_batch_id UUID`, `p_units INT`, `p_request_id UUID`, `p_user_id UUID`, `p_reason TEXT`
- **Returns**: `JSONB` confirming released inventory.
