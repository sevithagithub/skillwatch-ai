"""
Demand Forecasting Module — Real-Data Trained
==============================================
Uses scikit-learn with:
  - GradientBoostingRegressor for demand forecasting
  - CAGR-based extrapolation as baseline
  - Polynomial regression as secondary method
  - Ensemble combining all three for robust predictions

Training/validation based on real BLS + Lightcast data 2019-2024.
Forecast horizon: 3 years ahead.
"""

import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor


# ── Core Forecasting Functions ───────────────────────────────────────────────

def _cagr_forecast(years: list, values: list, forecast_years: int) -> list:
    """
    Compound Annual Growth Rate extrapolation.
    Most reliable for consistent growth trends.
    """
    if len(values) < 2 or values[0] <= 0:
        return [max(0, int(values[-1]))] * forecast_years

    n = len(values) - 1
    cagr = (values[-1] / max(values[0], 1)) ** (1 / max(n, 1)) - 1

    # Dampen extreme growth rates (e.g. GenAI 500%+) for realism
    # Real markets correct — LinkedIn data shows GenAI growth decelerating after 2023
    if cagr > 1.0:     # >100% CAGR → dampen strongly
        cagr = 0.40 + (cagr - 1.0) * 0.05
    elif cagr > 0.5:   # >50% CAGR → dampen moderately
        cagr = 0.25 + (cagr - 0.5) * 0.30
    elif cagr < -0.3:  # Severe decline → floor at -30%
        cagr = max(cagr, -0.30)

    last_year = max(years)
    results = []
    last_val = values[-1]
    for i in range(1, forecast_years + 1):
        next_val = max(0, int(round(last_val * (1 + cagr) ** i)))
        results.append({"year": int(last_year) + i, "value": next_val, "is_projected": 1})
    return results


def _polynomial_forecast(years: list, values: list, forecast_years: int) -> list:
    """
    Polynomial regression forecast (degree 2 max to avoid overfitting).
    Best for skills with clear parabolic demand curves.
    """
    if len(years) < 3:
        return _cagr_forecast(years, values, forecast_years)

    X = np.array(years).reshape(-1, 1)
    y = np.array(values, dtype=float)

    degree = min(2, len(years) - 1)
    model = Pipeline([
        ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
        ("reg", Ridge(alpha=10.0)),  # regularized to prevent wild extrapolation
    ])
    model.fit(X, y)

    last_year = max(years)
    results = []
    for i in range(1, forecast_years + 1):
        yr = last_year + i
        pred = float(model.predict([[yr]])[0])
        results.append({"year": int(yr), "value": max(0, int(round(pred))), "is_projected": 1})
    return results


def _gradient_boosting_forecast(years: list, values: list, forecast_years: int) -> list:
    """
    Gradient Boosting forecast with engineered temporal features.
    Uses lag features for more accurate short-term projections.
    """
    if len(years) < 4:
        return _polynomial_forecast(years, values, forecast_years)

    y = np.array(values, dtype=float)
    yr = np.array(years, dtype=float)

    # Normalize year
    yr_norm = (yr - yr.min()) / (yr.max() - yr.min() + 1e-9)

    # Features: normalized year, lag-1, lag-2, log-value
    X_rows = []
    y_rows = []
    for i in range(2, len(yr)):
        X_rows.append([
            yr_norm[i],
            y[i - 1] / max(y.max(), 1),   # lag-1
            y[i - 2] / max(y.max(), 1),   # lag-2
            np.log1p(y[i - 1]) / np.log1p(y.max() + 1),
        ])
        y_rows.append(y[i] / max(y.max(), 1))

    if len(X_rows) < 2:
        return _polynomial_forecast(years, values, forecast_years)

    model = GradientBoostingRegressor(
        n_estimators=100, max_depth=2, learning_rate=0.1,
        random_state=42, subsample=0.9
    )
    model.fit(np.array(X_rows), np.array(y_rows))

    yr_scale = yr.max() - yr.min() + 1e-9
    last_yr_norm = yr_norm[-1]
    last_two = list(y[-2:])
    results = []
    last_year = int(yr[-1])

    for i in range(1, forecast_years + 1):
        next_yr_norm = last_yr_norm + (i / yr_scale)
        X_pred = [[
            min(next_yr_norm, 2.0),
            last_two[-1] / max(y.max(), 1),
            last_two[-2] / max(y.max(), 1),
            np.log1p(last_two[-1]) / np.log1p(y.max() + 1),
        ]]
        pred_norm = float(model.predict(np.array(X_pred))[0])
        pred = max(0, int(round(pred_norm * y.max())))
        results.append({"year": last_year + i, "value": pred, "is_projected": 1})
        last_two = [last_two[-1], float(pred)]

    return results


def forecast_demand(years: list, values: list, forecast_years: int = 3,
                    degree: int = 2) -> list:
    """
    Ensemble forecast combining CAGR, polynomial, and gradient boosting.
    Weights are chosen based on dataset size:
      - Short series (<4 pts): CAGR dominates
      - Medium series (4-5 pts): poly + CAGR ensemble
      - Full series (6+ pts): all three methods

    Args:
        years:         List of historical years [2019, 2020, ...]
        values:        Corresponding demand values
        forecast_years: How many years ahead to predict
        degree:        Polynomial degree (kept for API compat, capped at 2)

    Returns:
        List of dicts: [{year, value, is_projected}, ...]
    """
    if len(years) < 2:
        return []

    n = len(years)

    # Build historical section
    results = []
    for i, yr in enumerate(years):
        results.append({"year": int(yr), "value": int(values[i]), "is_projected": 0})

    # Ensemble projection
    cagr_pred   = _cagr_forecast(years, values, forecast_years)
    poly_pred   = _polynomial_forecast(years, values, forecast_years)

    if n >= 4:
        gb_pred = _gradient_boosting_forecast(years, values, forecast_years)
    else:
        gb_pred = cagr_pred

    # Ensemble weights by data size
    if n < 4:
        w_cagr, w_poly, w_gb = 0.60, 0.40, 0.00
    elif n < 6:
        w_cagr, w_poly, w_gb = 0.30, 0.40, 0.30
    else:
        w_cagr, w_poly, w_gb = 0.25, 0.35, 0.40

    for i in range(forecast_years):
        v_cagr = cagr_pred[i]["value"]
        v_poly = poly_pred[i]["value"]
        v_gb   = gb_pred[i]["value"] if gb_pred else v_cagr

        ensemble_val = int(round(
            w_cagr * v_cagr + w_poly * v_poly + w_gb * v_gb
        ))
        results.append({
            "year": int(years[-1]) + i + 1,
            "value": max(0, ensemble_val),
            "is_projected": 1,
        })

    return results


def forecast_skill(demand_data: list) -> dict:
    """
    Given a list of yearly records for a skill, forecast demand and salary.

    Args:
        demand_data: List of dicts with keys: year, job_postings, avg_salary_usd

    Returns:
        Dict with demand_forecast and salary_forecast lists
    """
    if not demand_data:
        return {"demand_forecast": [], "salary_forecast": []}

    years    = [d["year"] for d in demand_data]
    postings = [d["job_postings"] for d in demand_data]
    salaries = [d["avg_salary_usd"] for d in demand_data]

    # Demand: full ensemble
    demand_forecast = forecast_demand(years, postings, forecast_years=3)

    # Salary: polynomial only (salaries trend more smoothly than demand)
    salary_historical = []
    for i, yr in enumerate(years):
        salary_historical.append({"year": int(yr), "value": int(salaries[i]), "is_projected": 0})

    salary_proj = _polynomial_forecast(years, salaries, forecast_years=3)
    salary_forecast = salary_historical + salary_proj

    return {
        "demand_forecast": demand_forecast,
        "salary_forecast": salary_forecast,
    }


def compute_trend_direction(values: list) -> str:
    """Determine if a series is growing, declining, or stable (BLS terminology)."""
    if len(values) < 2:
        return "stable"

    # Use CAGR over full period for consistency with BLS methodology
    cagr = (values[-1] / max(values[0], 1)) ** (1 / max(len(values) - 1, 1)) - 1

    if cagr > 0.08:    # >8% CAGR = BLS "much faster than average"
        return "growing"
    elif cagr < -0.05: # <-5% CAGR = declining
        return "declining"
    return "stable"
