"""Clinical compatibility rules and explainable donor ranking pipeline for BloodLink."""

from typing import List, Dict, Any, Tuple
import math
from datetime import datetime, date

# RBC & Whole Blood Compatibility Matrix
# Key = Donor Blood Group, Value = Set of recipient blood groups donor can donate RBCs to
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

# Plasma Compatibility Matrix (Reverse ABO antibodies: AB is universal donor, O is universal recipient)
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

MIN_DONATION_INTERVAL_DAYS: Dict[str, int] = {
    "Whole Blood": 56,
    "Red Blood Cells": 112,
    "Platelets": 7,
    "Fresh Frozen Plasma": 28,
    "Cryoprecipitate": 28,
}


def is_clinically_compatible(donor_group: str, recipient_group: str, component: str = "Whole Blood") -> bool:
    """Check clinical compatibility based on blood group and blood component."""
    if component == "Fresh Frozen Plasma":
        allowed = PLASMA_COMPATIBILITY.get(donor_group, set())
        return recipient_group in allowed
    # Default to RBC rules (for Whole Blood, Platelets, Cryoprecipitate, Red Blood Cells)
    allowed = RBC_COMPATIBILITY.get(donor_group, set())
    return recipient_group in allowed


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate approximate great-circle distance between two geographic coordinates in kilometers."""
    radius_earth_km = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(radius_earth_km * c, 2)


def check_donor_interval_eligibility(last_donation_date_str: str | None, component: str = "Whole Blood") -> Tuple[bool, int, str]:
    """Check whether sufficient time has elapsed since last donation."""
    if not last_donation_date_str:
        return True, 999, "First-time or eligible donor (no previous donation recorded within cooldown window)"

    try:
        last_date = datetime.strptime(last_donation_date_str, "%Y-%m-%d").date()
    except Exception:
        return True, 999, "Eligibility date parsing skipped; subject to clinical screening"

    days_since = (date.today() - last_date).days
    required_interval = MIN_DONATION_INTERVAL_DAYS.get(component, 56)

    if days_since >= required_interval:
        return True, days_since, f"Eligible: {days_since} days since last donation (minimum interval: {required_interval} days)"
    else:
        days_remaining = required_interval - days_since
        return False, days_since, f"Ineligible interval: {days_remaining} days remaining until safe donation interval ({required_interval} days required)"


def rank_donor_candidates(
    request: Dict[str, Any],
    donors: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Explainable donor ranking pipeline:
    1. Clinical compatibility filter (hard requirement - cannot be overridden)
    2. Consent and availability filter
    3. Interval eligibility requirement
    4. Distance evaluation against donor travel radius
    5. Scoring:
       - Compatibility: 40 points (exact matches receive 40, universal compatible receive 35)
       - Proximity: 30 points (inversely proportional to distance)
       - Recency & Eligibility: 20 points
       - Donation History Reliability: 10 points
    """
    req_group = request.get("blood_group", "")
    req_comp = request.get("blood_component", "Whole Blood")
    req_lat = request.get("latitude")
    req_lon = request.get("longitude")

    ranked_results = []

    for d in donors:
        donor_group = d.get("blood_group", "")
        # Step 1: Hard clinical compatibility
        if not is_clinically_compatible(donor_group, req_group, req_comp):
            continue

        # Step 2: Consent and availability
        if not d.get("is_available", False) or not d.get("consent_emergency_alerts", True):
            continue

        # Step 3: Medical interval check
        last_date = d.get("last_donation_date")
        is_eligible, days_elapsed, interval_msg = check_donor_interval_eligibility(last_date, req_comp)
        if not is_eligible:
            continue

        # Step 4: Distance calculation
        d_lat = d.get("latitude")
        d_lon = d.get("longitude")
        radius = d.get("travel_radius_km", 25)

        distance_km = None
        if req_lat is not None and req_lon is not None and d_lat is not None and d_lon is not None:
            distance_km = calculate_haversine_distance(req_lat, req_lon, d_lat, d_lon)
            if distance_km > radius:
                # Outside donor's consented travel radius
                continue

        # Step 5: Explainable transparent scoring
        score_breakdown = []
        total_score = 0.0

        # Factor A: Compatibility (max 40)
        if donor_group == req_group:
            comp_score = 40.0
            comp_reason = f"Exact blood group match ({donor_group})"
        else:
            comp_score = 35.0
            comp_reason = f"Clinically compatible group ({donor_group} for {req_group} {req_comp})"
        total_score += comp_score
        score_breakdown.append({"factor": "Clinical Compatibility", "points": comp_score, "max": 40, "details": comp_reason})

        # Factor B: Geographic Proximity (max 30)
        if distance_km is not None:
            prox_score = max(5.0, round(30.0 * max(0.0, 1.0 - (distance_km / max(radius, 1))), 1))
            prox_reason = f"Distance ~{distance_km} km (within {radius} km limit)"
        else:
            prox_score = 15.0
            prox_reason = "Manual city match without exact GPS coordinate"
        total_score += prox_score
        score_breakdown.append({"factor": "Proximity", "points": prox_score, "max": 30, "details": prox_reason})

        # Factor C: Eligibility & Cooldown (max 20)
        elig_score = 20.0
        total_score += elig_score
        score_breakdown.append({"factor": "Interval Eligibility", "points": elig_score, "max": 20, "details": interval_msg})

        # Factor D: Reliability & Previous Donations (max 10)
        total_donations = d.get("total_donations", 0)
        rel_score = min(10.0, round(2.0 + min(total_donations, 8) * 1.0, 1))
        total_score += rel_score
        score_breakdown.append({
            "factor": "History & Experience",
            "points": rel_score,
            "max": 10,
            "details": f"{total_donations} verified successful prior donations"
        })

        ranked_results.append({
            "donor_id": d.get("id"),
            "user_id": d.get("user_id"),
            "donor_name": d.get("donor_name", "Consented Donor"),
            "blood_group": donor_group,
            "city": d.get("city"),
            "area": d.get("area"),
            "distance_km": distance_km,
            "total_donations": total_donations,
            "match_score": round(total_score, 1),
            "reasons": score_breakdown,
            "clinical_disclaimer": "AI ranking does not replace pre-donation clinical screening by medical professionals."
        })

    # Sort descending by match_score, then ascending by distance
    ranked_results.sort(key=lambda x: (-x["match_score"], x["distance_km"] if x["distance_km"] is not None else 999))
    return ranked_results
