"""BloodLink AI Service - FastAPI application for Donor Matching and Blood Demand Forecasting."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.models.matching import (
    rank_donor_candidates,
    is_clinically_compatible,
    calculate_haversine_distance,
    check_donor_interval_eligibility
)
from app.models.forecaster import (
    train_and_forecast_demand
)

app = FastAPI(
    title="BloodLink AI Engine",
    description="Explainable Donor Matching & Clinical Compatibility Service, plus scikit-learn Demand Forecaster.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DonorCandidateInput(BaseModel):
    id: str
    user_id: Optional[str] = None
    donor_name: Optional[str] = "Anonymous Donor"
    blood_group: str
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    travel_radius_km: int = 25
    is_available: bool = True
    consent_emergency_alerts: bool = True
    consent_share_approx_location: bool = True
    last_donation_date: Optional[str] = None
    total_donations: int = 0


class BloodRequestInput(BaseModel):
    request_id: Optional[str] = None
    blood_group: str
    blood_component: str = "Whole Blood"
    units_needed: int = 1
    urgency: str = "high"
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MatchRankingRequest(BaseModel):
    request: BloodRequestInput
    donors: List[DonorCandidateInput]


class ForecastRequest(BaseModel):
    blood_group: str = "O+"
    blood_component: str = "Whole Blood"
    forecast_horizon_days: int = Field(default=7, ge=1, le=30)
    current_available_stock: int = Field(default=15, ge=0)
    historical_records: Optional[List[Dict[str, Any]]] = None


@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "BloodLink AI Engine",
        "version": "1.0.0",
        "models_ready": True
    }


@app.post("/api/v1/matching/rank-donors")
def match_and_rank_donors(payload: MatchRankingRequest):
    """
    Ranks donors using transparent, explainable clinical & proximity rules:
    - Rejects incompatible blood groups
    - Filters unavailable or ineligible donors
    - Calculates distance within radius
    - Computes explainable score
    """
    try:
        req_dict = payload.request.model_dump()
        donor_list = [d.model_dump() for d in payload.donors]
        ranked = rank_donor_candidates(req_dict, donor_list)
        return {
            "success": True,
            "request_blood_group": payload.request.blood_group,
            "blood_component": payload.request.blood_component,
            "total_candidates_evaluated": len(payload.donors),
            "qualified_donors_count": len(ranked),
            "ranked_donors": ranked
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/forecast/demand")
def forecast_demand(payload: ForecastRequest):
    """
    Predicts future daily blood demand using Ridge Regression with rolling baseline fallback.
    Identifies potential shortages against usable stock.
    """
    try:
        result = train_and_forecast_demand(
            history_records=payload.historical_records,
            blood_group=payload.blood_group,
            blood_component=payload.blood_component,
            forecast_horizon_days=payload.forecast_horizon_days,
            current_available_stock=payload.current_available_stock
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/clinical/compatibility-check")
def check_compatibility(donor_group: str, recipient_group: str, component: str = "Whole Blood"):
    compatible = is_clinically_compatible(donor_group, recipient_group, component)
    return {
        "donor_group": donor_group,
        "recipient_group": recipient_group,
        "component": component,
        "is_compatible": compatible,
        "rules_source": "AABB / Red Cross Clinical Transfusion Guidelines"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
