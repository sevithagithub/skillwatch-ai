"""Skills API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import Skill, SkillDemand
from database.schemas import SkillResponse, SkillDemandResponse
from ml.sdi import compute_full_sdi

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("/", response_model=List[SkillResponse])
def get_all_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.sdi.desc()).all()
    return skills


@router.get("/{skill_name}")
def get_skill_detail(skill_name: str, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.name.ilike(f"%{skill_name}%")).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    # Get historical demand data
    demands = db.query(SkillDemand).filter(
        SkillDemand.skill == skill.name
    ).order_by(SkillDemand.year).all()

    demand_list = [{
        "year": d.year,
        "job_postings": d.job_postings,
        "avg_salary_usd": d.avg_salary_usd,
        "automation_risk": d.automation_risk,
        "course_count": d.course_count,
        "hiring_trend": d.hiring_trend,
    } for d in demands]

    # Recompute SDI from actual data
    if demands:
        sdi_result = compute_full_sdi(
            job_postings=[d.job_postings for d in demands],
            automation_risks=[d.automation_risk for d in demands],
            course_counts=[d.course_count for d in demands],
            salaries=[d.avg_salary_usd for d in demands],
        )
    else:
        sdi_result = {
            "sdi": skill.sdi, "risk": skill.risk,
            "demand_decline": 0, "automation_risk": skill.automation_risk,
            "oversupply": 0, "salary_stagnation": 0,
        }

    return {
        "id": skill.id,
        "name": skill.name,
        "category": skill.category,
        "description": skill.description,
        "sdi": sdi_result["sdi"],
        "risk": sdi_result["risk"],
        "factors": {
            "demand_decline": sdi_result["demand_decline"],
            "automation_risk": sdi_result["automation_risk"],
            "oversupply": sdi_result["oversupply"],
            "salary_stagnation": sdi_result["salary_stagnation"],
        },
        "demand_history": demand_list,
    }


@router.get("/{skill_name}/demand", response_model=List[SkillDemandResponse])
def get_skill_demand(skill_name: str, db: Session = Depends(get_db)):
    demands = db.query(SkillDemand).filter(
        SkillDemand.skill.ilike(f"%{skill_name}%")
    ).order_by(SkillDemand.year).all()
    return demands
