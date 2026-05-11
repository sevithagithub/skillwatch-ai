"""Resources API endpoints."""

from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database.database import get_db
from database.models import Resource
from database.schemas import ResourceResponse

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("/{skill_name}", response_model=List[ResourceResponse])
def get_resources(skill_name: str, cost_type: Optional[str] = None,
                  resource_type: Optional[str] = None,
                  db: Session = Depends(get_db)):
    """Get learning resources for a skill, with optional filters."""
    query = db.query(Resource).filter(Resource.skill.ilike(f"%{skill_name}%"))

    if cost_type:
        query = query.filter(Resource.cost_type == cost_type)
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)

    resources = query.order_by(Resource.rating.desc()).all()
    return resources


@router.get("/")
def get_all_resources(db: Session = Depends(get_db)):
    """Get all resources grouped by skill then resource_type."""
    resources = db.query(Resource).order_by(Resource.rating.desc()).all()
    grouped: dict = {}
    for r in resources:
        if r.skill not in grouped:
            grouped[r.skill] = defaultdict(list)
        grouped[r.skill][r.resource_type].append({
            "id": r.id,
            "title": r.title,
            "platform": r.platform,
            "url": r.url,
            "rating": r.rating,
            "cost_type": r.cost_type,
            "duration_hrs": r.duration_hrs,
            "level": r.level,
        })
    # Convert defaultdicts to plain dicts for JSON serialization
    return {skill: dict(types) for skill, types in grouped.items()}
