"""Tests for BloodLink AI Engine matching and forecasting logic."""

import pytest
from app.models.matching import (
    is_clinically_compatible,
    calculate_haversine_distance,
    check_donor_interval_eligibility,
    rank_donor_candidates
)
from app.models.forecaster import (
    train_and_forecast_demand,
    generate_synthetic_historical_demand
)


def test_clinical_compatibility_rules():
    # O- is universal RBC donor
    assert is_clinically_compatible("O-", "AB+", "Red Blood Cells") is True
    assert is_clinically_compatible("O-", "O-", "Red Blood Cells") is True
    assert is_clinically_compatible("O-", "A+", "Whole Blood") is True

    # A+ cannot give RBCs to O- or B+
    assert is_clinically_compatible("A+", "O-", "Red Blood Cells") is False
    assert is_clinically_compatible("A+", "B+", "Red Blood Cells") is False
    assert is_clinically_compatible("A+", "AB+", "Red Blood Cells") is True

    # Plasma: AB+ is universal plasma donor
    assert is_clinically_compatible("AB+", "O+", "Fresh Frozen Plasma") is True
    assert is_clinically_compatible("O+", "AB+", "Fresh Frozen Plasma") is False


def test_haversine_distance():
    # Times Square (40.7580, -73.9855) to Brooklyn Bridge (40.7061, -73.9969) ~ 5.8 km
    dist = calculate_haversine_distance(40.7580, -73.9855, 40.7061, -73.9969)
    assert 5.0 <= dist <= 7.0


def test_donor_cooldown_eligibility():
    # None date -> eligible
    eligible, _, _ = check_donor_interval_eligibility(None, "Whole Blood")
    assert eligible is True

    # Recent donation (5 days ago) should be ineligible for Whole Blood (requires 56 days)
    import datetime
    recent_date = (datetime.date.today() - datetime.timedelta(days=5)).strftime("%Y-%m-%d")
    eligible, days, _ = check_donor_interval_eligibility(recent_date, "Whole Blood")
    assert eligible is False
    assert days == 5


def test_explainable_donor_ranking():
    request = {
        "blood_group": "A+",
        "blood_component": "Whole Blood",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    donors = [
        {
            "id": "donor-1",
            "donor_name": "Incompatible Donor",
            "blood_group": "B+",  # Incompatible with A+ recipient
            "latitude": 40.7129,
            "longitude": -74.0061,
            "is_available": True,
            "consent_emergency_alerts": True,
            "travel_radius_km": 20,
            "total_donations": 10
        },
        {
            "id": "donor-2",
            "donor_name": "Compatible Exact Match",
            "blood_group": "A+",
            "latitude": 40.7130,
            "longitude": -74.0062,
            "is_available": True,
            "consent_emergency_alerts": True,
            "travel_radius_km": 20,
            "total_donations": 5
        },
        {
            "id": "donor-3",
            "donor_name": "Unavailable Donor",
            "blood_group": "A+",
            "is_available": False,  # Not available
            "consent_emergency_alerts": True,
            "travel_radius_km": 20,
            "total_donations": 2
        }
    ]

    ranked = rank_donor_candidates(request, donors)
    assert len(ranked) == 1
    assert ranked[0]["donor_id"] == "donor-2"
    assert ranked[0]["match_score"] >= 80
    assert len(ranked[0]["reasons"]) == 4


def test_demand_forecast_model():
    result = train_and_forecast_demand(
        blood_group="O+",
        blood_component="Red Blood Cells",
        forecast_horizon_days=7,
        current_available_stock=5
    )
    assert len(result["forecast_points"]) == 7
    assert "stock_gap" in result
    assert result["shortage_risk"] in ("low", "moderate", "high")
    assert result["model_mae"] >= 0.0
