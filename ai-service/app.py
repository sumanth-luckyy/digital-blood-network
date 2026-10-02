"""BloodLink AI Service - FastAPI application.
Provides explainable prototype donor matching and blood demand forecasting.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from matching import (
    rank_donor_candidates_prototype,
    is_clinically_compatible,
    calculate_haversine_distance
)
from forecasting import (
    forecast_7day_demand
)

app = FastAPI(
    title="BloodLink AI Engine (Prototype)",
    description="Explainable donor matching (50% proximity, 30% availability, 20% response suitability) and 7-day demand forecasting.",
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
    donor_name: Optional[str] = "Anonymous Donor"
    blood_group: str
    city: Optional[str] = "New York"
    latitude: Optional[float] = 40.7150
    longitude: Optional[float] = -74.0020
    travel_radius_km: int = 25
    is_available: bool = True
    total_donations: int = 0


class BloodRequestInput(BaseModel):
    blood_group: str
    blood_component: str = "Whole Blood"
    units_needed: int = 1
    urgency: str = "high"
    city: Optional[str] = "New York"
    latitude: Optional[float] = 40.7128
    longitude: Optional[float] = -74.0060


class MatchRankingRequest(BaseModel):
    request: BloodRequestInput
    donors: List[DonorCandidateInput]


class ForecastRequest(BaseModel):
    blood_group: str = "O-"
    current_available_stock: int = 4
    forecast_horizon_days: int = 7


@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "BloodLink AI Engine",
        "prototype_version": "1.0.0",
        "matching_formula": "50% proximity, 30% availability, 20% response suitability",
        "disclaimer": "Prototype / demo algorithms. Not clinically validated medical algorithms."
    }


@app.post("/api/v1/matching/rank-donors")
def match_donors(payload: MatchRankingRequest):
    try:
        req_dict = payload.request.model_dump()
        donor_list = [d.model_dump() for d in payload.donors]
        ranked = rank_donor_candidates_prototype(req_dict, donor_list)
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
def forecast(payload: ForecastRequest):
    try:
        data = forecast_7day_demand(
            blood_group=payload.blood_group,
            current_available_stock=payload.current_available_stock,
            horizon_days=payload.forecast_horizon_days
        )
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
