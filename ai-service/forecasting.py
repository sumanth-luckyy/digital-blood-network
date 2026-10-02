"""Blood Demand Forecasting Module for BloodLink using scikit-learn Ridge Regression and rolling baseline."""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error


def generate_synthetic_history(blood_group: str = "O-", days: int = 60) -> pd.DataFrame:
    """Generate synthetic historical daily demand data."""
    np.random.seed(42)
    dates = [datetime.now().date() - timedelta(days=i) for i in range(days, 0, -1)]

    multipliers = {
        "O-": 1.2, "O+": 1.5, "A+": 1.3, "A-": 0.8,
        "B+": 1.0, "B-": 0.6, "AB+": 0.7, "AB-": 0.3
    }
    m = multipliers.get(blood_group, 1.0)

    rows = []
    for d in dates:
        wd = d.weekday()
        weekday_bias = 1.3 if wd in (1, 2, 3) else 0.85
        noise = np.random.poisson(lam=3.0)
        units = max(1, int(round(3.5 * m * weekday_bias + noise * 0.3)))
        rows.append({
            "date": d,
            "blood_group": blood_group,
            "units_demanded": units,
            "weekday": wd,
            "is_weekend": 1 if wd >= 5 else 0
        })
    return pd.DataFrame(rows)


def forecast_7day_demand(
    blood_group: str = "O-",
    current_available_stock: int = 4,
    horizon_days: int = 7
) -> Dict[str, Any]:
    """
    Generate 7-day demand forecast using Ridge Regression.
    Identifies expected shortage and risk level.
    Clearly labeled as prototype/synthetic demonstration.
    """
    df = generate_synthetic_history(blood_group, days=60)
    df["lag_1"] = df["units_demanded"].shift(1)
    df["rolling_7"] = df["units_demanded"].shift(1).rolling(7, min_periods=1).mean()
    df = df.dropna().reset_index(drop=True)

    X = df[["weekday", "is_weekend", "lag_1", "rolling_7"]]
    y = df["units_demanded"]

    model = Ridge(alpha=1.0)
    model.fit(X, y)

    last_date = df["date"].max()
    forecast_points = []
    total_projected = 0.0

    curr_lag = float(df["units_demanded"].iloc[-1])
    recent_vals = list(df["units_demanded"].iloc[-7:].values)
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for i in range(1, horizon_days + 1):
        target_date = last_date + timedelta(days=i)
        wd = target_date.weekday()
        is_wknd = 1 if wd >= 5 else 0
        rolling_val = float(np.mean(recent_vals[-7:]))

        feat = np.array([[wd, is_wknd, curr_lag, rolling_val]])
        pred = max(1.0, round(float(model.predict(feat)[0]), 1))
        lower = max(0.0, round(pred - 1.2, 1))
        upper = round(pred + 1.5, 1)

        forecast_points.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day": days_of_week[wd],
            "predicted_units": pred,
            "lower_bound": lower,
            "upper_bound": upper,
        })
        total_projected += pred
        recent_vals.append(pred)
        curr_lag = pred

    stock_gap = round(current_available_stock - total_projected, 1)
    if stock_gap < 0:
        risk_level = "high" if abs(stock_gap) > (current_available_stock * 0.5) else "moderate"
        warning = f"Projected shortage: Expected demand ({round(total_projected, 1)} units) exceeds current stock ({current_available_stock} units) by {abs(stock_gap)} units."
    else:
        risk_level = "low"
        warning = f"Stock adequate: Available stock ({current_available_stock} units) covers expected {horizon_days}-day demand ({round(total_projected, 1)} units)."

    return {
        "blood_group": blood_group,
        "forecast_horizon_days": horizon_days,
        "total_projected_demand": round(total_projected, 1),
        "current_available_stock": current_available_stock,
        "expected_shortage": abs(stock_gap) if stock_gap < 0 else 0.0,
        "stock_gap": stock_gap,
        "risk_level": risk_level,
        "warning_message": warning,
        "forecast_points": forecast_points,
        "data_type": "Synthetic Demonstration Data (Prototype Model)",
        "model_type": "Ridge-TimeSeries-v1.0"
    }
