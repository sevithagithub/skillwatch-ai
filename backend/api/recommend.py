"""Recommendation API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.schemas import RecommendRequest, RecommendResponse
from ml.recommendation import get_recommendations

router = APIRouter(prefix="/api/recommend", tags=["recommendations"])


@router.post("/")
def get_recommendation(data: RecommendRequest):
    """Get personalized skill recommendations."""
    result = get_recommendations(
        user_type=data.user_type,
        year=data.year,
        role=data.role,
        time_available=data.time_available,
        skills=data.skills or [],
        courses=data.courses or [],
    )
    return result
