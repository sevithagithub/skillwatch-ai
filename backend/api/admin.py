"""
Admin API — lets the project owner view all registered users,
their skills, and account stats. Protected by a simple admin key.
"""

import os
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database.database import get_db
from database.models import User

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Set ADMIN_KEY as an environment variable in your deployment
ADMIN_KEY = os.getenv("ADMIN_KEY", "skillwatch-admin-2024")


def verify_admin(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Admin access denied")


class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    user_type: Optional[str]
    role: Optional[str]
    year: Optional[int]
    skills: Optional[str]
    courses: Optional[str]
    created_at: Optional[datetime]
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/users", response_model=List[UserSummary])
def get_all_users(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    """Get all registered users. Requires X-Admin-Key header."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    """Get high-level platform statistics."""
    users = db.query(User).all()
    total = len(users)
    students = sum(1 for u in users if u.user_type == "student")
    professionals = sum(1 for u in users if u.user_type == "professional")
    universities = sum(1 for u in users if u.user_type == "university")

    # Top skills across all users
    skill_counts = {}
    for u in users:
        if u.skills:
            for s in u.skills.split(","):
                s = s.strip()
                if s:
                    skill_counts[s] = skill_counts.get(s, 0) + 1

    top_skills = sorted(skill_counts.items(), key=lambda x: -x[1])[:10]

    return {
        "total_users": total,
        "students": students,
        "professionals": professionals,
        "universities": universities,
        "top_skills": [{"skill": k, "count": v} for k, v in top_skills],
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    """Delete a user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted"}
