"""Forecast API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import SkillDemand, Forecast
from ml.forecasting import forecast_skill

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get("/")
def get_all_forecasts(db: Session = Depends(get_db)):
    """Get forecasts for all skills."""
    # Get distinct skills
    skills = db.query(SkillDemand.skill).distinct().all()
    results = {}

    for (skill_name,) in skills:
        demands = db.query(SkillDemand).filter(
            SkillDemand.skill == skill_name
        ).order_by(SkillDemand.year).all()

        demand_data = [{
            "year": d.year,
            "job_postings": d.job_postings,
            "avg_salary_usd": d.avg_salary_usd,
        } for d in demands]

        forecast = forecast_skill(demand_data)
        results[skill_name] = forecast

    return results


@router.get("/{skill_name}")
def get_forecast(skill_name: str, db: Session = Depends(get_db)):
    """Get demand and salary forecast for a skill."""
    demands = db.query(SkillDemand).filter(
        SkillDemand.skill.ilike(f"%{skill_name}%")
    ).order_by(SkillDemand.year).all()

    if not demands:
        raise HTTPException(status_code=404, detail="No data found for this skill")

    actual_name = demands[0].skill
    demand_data = [{
        "year": d.year,
        "job_postings": d.job_postings,
        "avg_salary_usd": d.avg_salary_usd,
    } for d in demands]

    result = forecast_skill(demand_data)

    return {
        "skill": actual_name,
        "demand_forecast": result["demand_forecast"],
        "salary_forecast": result["salary_forecast"],
    }
