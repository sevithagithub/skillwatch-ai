"""Graph API endpoints."""

from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
from ml.graph import get_graph_data, get_related_skills, get_transition_path, get_reskill_suggestions

router = APIRouter(prefix="/api/graph", tags=["graph"])


class ReskillRequest(BaseModel):
    skills: List[str]


@router.get("/")
def get_full_graph():
    """Get the full skill graph for visualization."""
    return get_graph_data()


@router.get("/related/{skill_name}")
def get_related(skill_name: str, depth: int = 1):
    """Get skills related to a given skill."""
    related = get_related_skills(skill_name, depth=depth)
    return {"skill": skill_name, "related": related}


@router.get("/path")
def get_path(from_skill: str, to_skill: str):
    """Find transition path between two skills."""
    path = get_transition_path(from_skill, to_skill)
    return {"from": from_skill, "to": to_skill, "path": path}


@router.post("/reskill")
def reskill(body: ReskillRequest):
    """Get reskilling suggestions for dying skills."""
    return get_reskill_suggestions(body.skills)
