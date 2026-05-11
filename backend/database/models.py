from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_type = Column(String)  # student, professional, university
    year = Column(Integer, nullable=True)  # for students
    role = Column(String, nullable=True)  # for professionals
    time_available = Column(String, nullable=True)  # low, medium, high
    skills = Column(Text, nullable=True)  # comma-separated
    courses = Column(Text, nullable=True)  # comma-separated for universities
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String)
    sdi = Column(Float)
    risk = Column(String)
    automation_risk = Column(Float)
    demand_trend = Column(Float)
    oversupply = Column(Float)
    salary_stagnation = Column(Float)
    description = Column(Text)


class SkillDemand(Base):
    __tablename__ = "skill_demands"

    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String, index=True, nullable=False)
    year = Column(Integer, nullable=False)
    job_postings = Column(Integer)
    avg_salary_usd = Column(Integer)
    automation_risk = Column(Float)
    course_count = Column(Integer)
    hiring_trend = Column(Float)


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String, index=True, nullable=False)
    resource_type = Column(String)  # course, book, practice
    title = Column(String)
    platform = Column(String)
    url = Column(String)
    rating = Column(Float)
    cost_type = Column(String)  # free, paid, freemium, free_audit
    duration_hrs = Column(Float, nullable=True)
    level = Column(String)


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String, index=True, nullable=False)
    year = Column(Integer, nullable=False)
    predicted_demand = Column(Integer)
    predicted_salary = Column(Integer)
    is_projected = Column(Integer, default=0)  # 0=actual, 1=projected


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String, nullable=False)
    country = Column(String)
    workforce_size = Column(Integer)
    high_risk_pct = Column(Float)
    medium_risk_pct = Column(Float)
    primary_at_risk_skills = Column(Text)  # comma-separated
    dominant_sector = Column(String)
