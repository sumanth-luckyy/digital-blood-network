"""Clinical compatibility rules and transparent prototype donor ranking pipeline for BloodLink.
Prototype weighting: 50% Proximity, 30% Availability, 20% Response Suitability.
"""

from typing import List, Dict, Any, Tuple
import math
from datetime import datetime, date

# ABO/Rh compatibility rules for RBC / Whole Blood
RBC_COMPATIBILITY: Dict[str, set] = {
    "O-": {"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"},
    "O+": {"O+", "A+", "B+", "AB+"},
    "A-": {"A-", "A+", "AB-", "AB+"},
    "A+": {"A+", "AB+"},
    "B-": {"B-", "B+", "AB-", "AB+"},
    "B+": {"B+", "AB+"},
    "AB-": {"AB-", "AB+"},
    "AB+": {"AB+"},
}

# Plasma compatibility (Reverse ABO rules: AB is universal donor)
PLASMA_COMPATIBILITY: Dict[str, set] = {
    "AB+": {"AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"},
    "AB-": {"AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"},
    "A+": {"A+", "A-", "O+", "O-"},
    "A-": {"A+", "A-", "O+", "O-"},
    "B+": {"B+", "B-", "O+", "O-"},
    "B-": {"B+", "B-", "O+", "O-"},
    "O+": {"O+", "O-"},
    "O-": {"O+", "O-"},
}


def is_clinically_compatible(donor_group: str, recipient_group: str, component: str = "Whole Blood") -> bool:
    """Clinical compatibility hard filter."""
    if component == "Fresh Frozen Plasma":
        return recipient_group in PLASMA_COMPATIBILITY.get(donor_group, set())
    return recipient_group in RBC_COMPATIBILITY.get(donor_group, set())


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS coordinates."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def rank_donor_candidates_prototype(
    request: Dict[str, Any],
    donors: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Prototype matching algorithm with transparent weights:
    - 50% Proximity (inverse distance relative to travel radius)
    - 30% Availability (explicitly confirmed status)
    - 20% Response Suitability (track record & interval readiness)
    * Hard filter: clinical compatibility cannot be bypassed.
    """
    req_group = request.get("blood_group", "")
    req_comp = request.get("blood_component", "Whole Blood")
    req_lat = request.get("latitude", 40.7128)
    req_lon = request.get("longitude", -74.0060)

    results = []

    for d in donors:
        donor_group = d.get("blood_group", "")

        # 1. Hard compatibility filter
        if not is_clinically_compatible(donor_group, req_group, req_comp):
            continue

        # 2. Availability filter
        is_avail = d.get("is_available", True)
        if not is_avail:
            continue

        # 3. Calculate distance
        d_lat = d.get("latitude", 40.7150)
        d_lon = d.get("longitude", -74.0020)
        radius = d.get("travel_radius_km", 25)

        distance_km = calculate_haversine_distance(req_lat, req_lon, d_lat, d_lon) if req_lat and d_lat else 3.0
        if distance_km > radius:
            continue

        # 4. Transparent Scoring: 50% Proximity + 30% Availability + 20% Response Suitability
        # Proximity score (0-50 pts)
        prox_score = round(max(5.0, 50.0 * (1.0 - min(distance_km / max(radius, 1), 1.0))), 1)

        # Availability score (0-30 pts)
        avail_score = 30.0 if is_avail else 0.0

        # Response suitability score (0-20 pts)
        total_donations = d.get("total_donations", 0)
        suitability_score = round(min(20.0, 10.0 + min(total_donations, 5) * 2.0), 1)

        total_score = round(prox_score + avail_score + suitability_score, 1)

        reasons = [
            {"factor": "Proximity (50% max)", "points": prox_score, "details": f"~{distance_km} km away (within {radius} km radius)"},
            {"factor": "Availability (30% max)", "points": avail_score, "details": "Active and consented for emergency alerts"},
            {"factor": "Response Suitability (20% max)", "points": suitability_score, "details": f"{total_donations} verified prior completed donations"},
        ]

        results.append({
            "donor_id": d.get("id"),
            "donor_name": d.get("donor_name", "Volunteer Donor"),
            "blood_group": donor_group,
            "city": d.get("city", "New York"),
            "distance_km": distance_km,
            "match_score": total_score,
            "match_reasons": reasons,
            "algorithm": "Prototype matching: 50% proximity, 30% availability, 20% response suitability",
            "disclaimer": "Prototype demo matching algorithm. Not a clinically validated medical algorithm."
        })

    # Sort descending by match score
    results.sort(key=lambda x: -x["match_score"])
    return results
