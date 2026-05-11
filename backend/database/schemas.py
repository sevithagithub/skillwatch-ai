from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    user_type: Optional[str] = None
    year: Optional[int] = None
    role: Optional[str] = None
    time_available: Optional[str] = None
    skills: Optional[List[str]] = None
    courses: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    user_type: Optional[str] = None
    year: Optional[int] = None
    role: Optional[str] = None
    time_available: Optional[str] = None
    skills: Optional[List[str]] = None
    courses: Optional[List[str]] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ── Skill Schemas ─────────────────────────────────────────────────────────────

class SkillResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    sdi: float
    risk: str
    automation_risk: float
    demand_trend: float
    oversupply: Optional[float] = None
    salary_stagnation: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class SkillDemandResponse(BaseModel):
    skill: str
    year: int
    job_postings: int
    avg_salary_usd: int
    automation_risk: float
    course_count: int
    hiring_trend: float

    class Config:
        from_attributes = True


class ForecastResponse(BaseModel):
    skill: str
    year: int
    predicted_demand: int
    predicted_salary: Optional[int] = None
    is_projected: int

    class Config:
        from_attributes = True


class ResourceResponse(BaseModel):
    id: int
    skill: str
    resource_type: str
    title: str
    platform: Optional[str] = None
    url: Optional[str] = None
    rating: float
    cost_type: str
    duration_hrs: Optional[float] = None
    level: Optional[str] = None

    class Config:
        from_attributes = True


class RegionResponse(BaseModel):
    id: int
    region: str
    country: str
    workforce_size: int
    high_risk_pct: float
    medium_risk_pct: float
    primary_at_risk_skills: List[str]
    dominant_sector: str

    class Config:
        from_attributes = True


# ── Recommendation Schemas ────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    user_type: str
    year: Optional[int] = None
    role: Optional[str] = None
    time_available: Optional[str] = None
    skills: Optional[List[str]] = None
    courses: Optional[List[str]] = None


class SkillRecommendation(BaseModel):
    skill: str
    reason: str
    priority: int
    sdi: Optional[float] = None
    risk: Optional[str] = None


class RecommendResponse(BaseModel):
    user_type: str
    focus: str
    timeframe: str
    recommendations: List[SkillRecommendation]


# ── Graph Schemas ─────────────────────────────────────────────────────────────

class GraphNode(BaseModel):
    id: str
    sdi: float
    risk: str
    category: Optional[str] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship_type: str
    strength: float


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
