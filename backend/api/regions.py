"""Region Risk API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import Region

router = APIRouter(prefix="/api/regions", tags=["regions"])


@router.get("/")
def get_all_regions(db: Session = Depends(get_db)):
    """Get all region risk data."""
    regions = db.query(Region).order_by(Region.high_risk_pct.desc()).all()
    return [{
        "id": r.id,
        "region": r.region,
        "country": r.country,
        "workforce_size": r.workforce_size,
        "high_risk_pct": r.high_risk_pct,
        "medium_risk_pct": r.medium_risk_pct,
        "primary_at_risk_skills": r.primary_at_risk_skills.split(",") if r.primary_at_risk_skills else [],
        "dominant_sector": r.dominant_sector,
    } for r in regions]


@router.get("/{region_name}")
def get_region(region_name: str, db: Session = Depends(get_db)):
    """Get risk data for a specific region."""
    region = db.query(Region).filter(Region.region.ilike(f"%{region_name}%")).first()
    if not region:
        return {"error": "Region not found"}
    return {
        "id": region.id,
        "region": region.region,
        "country": region.country,
        "workforce_size": region.workforce_size,
        "high_risk_pct": region.high_risk_pct,
        "medium_risk_pct": region.medium_risk_pct,
        "primary_at_risk_skills": region.primary_at_risk_skills.split(",") if region.primary_at_risk_skills else [],
        "dominant_sector": region.dominant_sector,
    }
