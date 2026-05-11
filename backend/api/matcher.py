from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel
from ml.matcher import get_job_matches
from api.auth import get_current_user

router = APIRouter(prefix="/api/matches", tags=["Matching"])

class JobMatch(BaseModel):
    job_title: str
    soc: str
    fit_score: float
    automation_risk: float
    matched_skills: List[str]
    missing_skills: List[str]

@router.get("/", response_model=List[JobMatch])
def match_jobs(current_user = Depends(get_current_user)):
    """
    Get job matches for the current user based on their skills.
    """
    # Assuming current_user.skills is a comma-separated string or a list
    user_skills = current_user.skills.split(",") if isinstance(current_user.skills, str) else (current_user.skills or [])
    return get_job_matches(user_skills)
