"""AI Blood Demand Forecasting using Rolling Average Baseline and scikit-learn models."""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error


def generate_synthetic_historical_demand(
    blood_group: str = "O+",
    blood_component: str = "Whole Blood",
    days: int = 90
) -> pd.DataFrame:
    """Generate realistic historical daily blood unit demand for training and evaluation."""
    np.random.seed(42)
    base_dates = [datetime.now().date() - timedelta(days=i) for i in range(days, 0, -1)]

    # Baseline daily demand variations
    group_multipliers = {
        "O+": 1.4, "O-": 1.1, "A+": 1.2, "A-": 0.7,
        "B+": 1.0, "B-": 0.5, "AB+": 0.6, "AB-": 0.3
    }
    multiplier = group_multipliers.get(blood_group, 1.0)

    records = []
    for d in base_dates:
        weekday = d.weekday()
        # Weekend emergency vs weekday elective surgery variation
        weekday_factor = 1.25 if weekday in (1, 2, 3) else 0.85
        # Seasonal/random trauma spikes
        noise = np.random.poisson(lam=4.0)
        units = max(1, int(round((4.0 * multiplier * weekday_factor) + (noise * 0.4))))
        records.append({
            "date": d,
            "blood_group": blood_group,
            "blood_component": blood_component,
            "units_demanded": units,
            "day_of_week": weekday,
            "is_weekend": 1 if weekday >= 5 else 0
        })

    return pd.DataFrame(records)


def train_and_forecast_demand(
    history_records: Optional[List[Dict[str, Any]]] = None,
    blood_group: str = "O+",
    blood_component: str = "Whole Blood",
    forecast_horizon_days: int = 7,
    current_available_stock: int = 15
) -> Dict[str, Any]:
    """
    Train model on past observations using rolling average baseline + Ridge regression.
    Evaluates MAE on a held-out temporal validation split to prevent future-data leakage.
    """
    if history_records and len(history_records) >= 14:
        df = pd.DataFrame(history_records)
        df["date"] = pd.to_datetime(df["date"]).dt.date
    else:
        df = generate_synthetic_historical_demand(blood_group, blood_component, days=90)

    df = df.sort_values("date").reset_index(drop=True)
    df["day_of_week"] = pd.to_datetime(df["date"]).dt.weekday
    df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)

    # Feature engineering without lookahead leakage:
    df["lag_1"] = df["units_demanded"].shift(1)
    df["lag_7"] = df["units_demanded"].shift(7)
    df["rolling_7_mean"] = df["units_demanded"].shift(1).rolling(window=7, min_periods=1).mean()
    df = df.dropna().reset_index(drop=True)

    # Time-based train-test split (train on earlier 80%, test on latest 20%)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    features = ["day_of_week", "is_weekend", "lag_1", "lag_7", "rolling_7_mean"]
    X_train = train_df[features]
    y_train = train_df["units_demanded"]
    X_test = test_df[features]
    y_test = test_df["units_demanded"]

    # Fit Ridge regression model
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    test_preds = model.predict(X_test)
    model_mae = float(round(mean_absolute_error(y_test, test_preds), 2))

    # Baseline: 7-day rolling average
    baseline_preds = test_df["rolling_7_mean"]
    baseline_mae = float(round(mean_absolute_error(y_test, baseline_preds), 2))

    # Generate forward predictions
    last_date = df["date"].max()
    forecast_items = []
    total_projected_demand = 0.0

    curr_lag_1 = float(df["units_demanded"].iloc[-1])
    recent_values = list(df["units_demanded"].iloc[-7:].values)

    for step in range(1, forecast_horizon_days + 1):
        target_date = last_date + timedelta(days=step)
        dow = target_date.weekday()
        is_wknd = 1 if dow >= 5 else 0
        lag_7_val = recent_values[-7] if len(recent_values) >= 7 else curr_lag_1
        rolling_7 = float(np.mean(recent_values[-7:]))

        feat_vec = np.array([[dow, is_wknd, curr_lag_1, lag_7_val, rolling_7]])
        pred_raw = float(model.predict(feat_vec)[0])
        pred_units = max(1.0, round(pred_raw, 1))

        # Prediction interval (+/- 1.5 * MAE)
        margin = max(1.0, round(model_mae * 1.5, 1))
        lower = max(0.0, round(pred_units - margin, 1))
        upper = round(pred_units + margin, 1)

        forecast_items.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day": target_date.strftime("%a"),
            "predicted_units": pred_units,
            "lower_bound": lower,
            "upper_bound": upper
        })
        total_projected_demand += pred_units

        # Update recursive state
        recent_values.append(pred_units)
        curr_lag_1 = pred_units

    # Stock Gap & Shortage Assessment
    stock_gap = round(current_available_stock - total_projected_demand, 1)
    if stock_gap < 0:
        shortage_risk = "high" if abs(stock_gap) > (current_available_stock * 0.5) else "moderate"
        shortage_message = (
            f"Potential shortage detected: Projected demand ({round(total_projected_demand, 1)} units) "
            f"exceeds current usable stock ({current_available_stock} units) by ~{abs(stock_gap)} units over {forecast_horizon_days} days."
        )
    else:
        shortage_risk = "low"
        shortage_message = f"Usable inventory ({current_available_stock} units) covers expected {forecast_horizon_days}-day demand ({round(total_projected_demand, 1)} units)."

    return {
        "blood_group": blood_group,
        "blood_component": blood_component,
        "forecast_horizon_days": forecast_horizon_days,
        "model_version": "Ridge-TimeSeries-v1.2",
        "model_mae": model_mae,
        "baseline_rolling_mae": baseline_mae,
        "performance_improvement_pct": round(max(0.0, ((baseline_mae - model_mae) / max(baseline_mae, 0.001)) * 100), 1),
        "total_projected_demand": round(total_projected_demand, 1),
        "current_available_stock": current_available_stock,
        "stock_gap": stock_gap,
        "shortage_risk": shortage_risk,
        "shortage_warning": shortage_message,
        "forecast_points": forecast_items,
        "disclaimer": "AI demand forecasting uses temporal machine learning baseline models. Clinical emergency reserves must be maintained independently."
    }

# Backward compatibility aliases
forecast_7day_demand = train_and_forecast_demand
generate_synthetic_history = generate_synthetic_historical_demand
