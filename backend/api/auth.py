"""Authentication API — uses bcrypt directly (passlib broken on Python 3.13)."""

import bcrypt
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database.database import get_db
from database.models import User
from database.schemas import UserCreate, UserLogin, UserProfile, UserResponse, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "skillwatch-ai-secret-key-2024-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer(auto_error=False)


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        print("[AUTH DEBUG] No credentials header found")
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        print(f"[AUTH DEBUG] Received token: {credentials.credentials[:10]}...")
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        print(f"[AUTH DEBUG] Decoded email: {email}")
        if not email:
            print("[AUTH DEBUG] No sub/email in payload")
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError as e:
        print(f"[AUTH DEBUG] JWT decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"[AUTH DEBUG] User {email} not found in database")
        raise HTTPException(status_code=401, detail="User not found")
    print("[AUTH DEBUG] Authentication successful")
    return user


# ── Response helper ───────────────────────────────────────────────────────────

def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        user_type=user.user_type,
        year=user.year,
        role=user.role,
        time_available=user.time_available,
        skills=[s.strip() for s in user.skills.split(",") if s.strip()] if user.skills else [],
        courses=[c.strip() for c in user.courses.split(",") if c.strip()] if user.courses else [],
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=Token)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed = hash_password(data.password)
    user = User(
        name=data.name or data.email.split("@")[0],
        email=data.email,
        password_hash=hashed,
        last_login=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_to_response(user),
    )


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Track last login time
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_to_response(user),
    )


def ensure_skill_exists(db: Session, skill_name: str):
    skill_name = skill_name.strip()
    if not skill_name:
        return
    
    from database.models import Skill, SkillDemand, Resource
    from ml.sdi import compute_full_sdi
    import random
    
    # Check if skill already exists (case-insensitive)
    existing = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
    if existing:
        return
    
    # Seed demand records for this new skill
    years = [2019, 2020, 2021, 2022, 2023, 2024]
    
    lower_name = skill_name.lower()
    if any(k in lower_name for k in ["python", "java", "c++", "javascript", "html", "css", "rust", "go", "php", "ruby", "typescript", "react", "angular", "vue", "node"]):
        category = "Programming"
        base_postings = random.randint(50000, 120000)
        postings_mult = [1.0, 1.15, 1.3, 1.45, 1.4, 1.5]
        base_salary = random.randint(85000, 115000)
        salary_mult = [1.0, 1.04, 1.08, 1.12, 1.15, 1.18]
        auto_risk = 0.15 + random.random() * 0.1
        base_courses = random.randint(4000, 8000)
        course_mult = [1.0, 1.15, 1.3, 1.45, 1.6, 1.8]
    elif any(k in lower_name for k in ["ml", "ai", "learning", "data", "sql", "db", "query"]):
        category = "AI / Data Science" if "ai" in lower_name or "learning" in lower_name else "Data"
        base_postings = random.randint(30000, 80000)
        postings_mult = [1.0, 1.25, 1.5, 1.8, 2.1, 2.5] if "ai" in lower_name or "learning" in lower_name else [1.0, 1.05, 1.1, 1.15, 1.2, 1.25]
        base_salary = random.randint(95000, 135000)
        salary_mult = [1.0, 1.06, 1.12, 1.18, 1.24, 1.3]
        auto_risk = 0.05 + random.random() * 0.1
        base_courses = random.randint(2000, 5000)
        course_mult = [1.0, 1.2, 1.4, 1.7, 2.1, 2.6]
    else:
        category = "Other"
        base_postings = random.randint(15000, 45000)
        postings_mult = [1.0, 1.05, 1.1, 1.12, 1.15, 1.18]
        base_salary = random.randint(65000, 85000)
        salary_mult = [1.0, 1.03, 1.06, 1.08, 1.1, 1.12]
        auto_risk = 0.2 + random.random() * 0.3
        base_courses = random.randint(1000, 3000)
        course_mult = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]

    demands = []
    for i, year in enumerate(years):
        d = SkillDemand(
            skill=skill_name,
            year=year,
            job_postings=int(base_postings * postings_mult[i]),
            avg_salary_usd=int(base_salary * salary_mult[i]),
            automation_risk=round(auto_risk - (i * 0.005), 3),
            course_count=int(base_courses * course_mult[i]),
            hiring_trend=round((postings_mult[i] - postings_mult[max(0, i-1)]) / postings_mult[max(0, i-1)], 2) if i > 0 else 0.1,
        )
        db.add(d)
        demands.append(d)
    
    # Calculate SDI score using ML model
    sdi_result = compute_full_sdi(
        skill_name=skill_name,
        job_postings=[d.job_postings for d in demands],
        automation_risks=[d.automation_risk for d in demands],
        course_counts=[d.course_count for d in demands],
        salaries=[d.avg_salary_usd for d in demands],
    )
    
    # Create Skill record
    new_skill = Skill(
        name=skill_name,
        category=category,
        sdi=sdi_result["sdi"],
        risk=sdi_result["risk"],
        automation_risk=sdi_result["automation_risk"],
        demand_trend=sdi_result["demand_decline"],
        oversupply=sdi_result["oversupply"],
        salary_stagnation=sdi_result["salary_stagnation"],
        description=f"{skill_name} is a vital skill in the modern {category.lower()} ecosystem.",
    )
    db.add(new_skill)
    
    # Add a couple of realistic fallback resource learning cards
    platforms = ["Coursera", "Udemy", "YouTube"]
    levels = ["Beginner", "Intermediate", "Advanced"]
    
    r1 = Resource(
        skill=skill_name,
        resource_type="course",
        title=f"Complete {skill_name} bootcamp for Developers",
        platform=random.choice(platforms),
        url="https://coursera.org",
        rating=round(4.4 + random.random() * 0.5, 1),
        cost_type="paid",
        duration_hrs=float(random.randint(12, 45)),
        level=random.choice(levels),
    )
    r2 = Resource(
        skill=skill_name,
        resource_type="practice",
        title=f"Mastering {skill_name} - Practical Sandbox & Exercises",
        platform="FreeCodeCamp",
        url="https://youtube.com",
        rating=round(4.6 + random.random() * 0.3, 1),
        cost_type="free",
        duration_hrs=float(random.randint(4, 10)),
        level="Beginner",
    )
    db.add(r1)
    db.add(r2)
    
    db.commit()
    print(f"[DYNAMIC SEED] Successfully seeded missing skill: {skill_name}")


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if profile.user_type is not None:
        current_user.user_type = profile.user_type
    if profile.year is not None:
        current_user.year = profile.year
    if profile.role is not None:
        current_user.role = profile.role
    if profile.time_available is not None:
        current_user.time_available = profile.time_available
    if profile.skills is not None:
        current_user.skills = ",".join(s.strip() for s in profile.skills if s.strip())
        # Dynamically seed any newly entered skills that do not exist in the database
        for s in profile.skills:
            ensure_skill_exists(db, s)
    if profile.courses is not None:
        current_user.courses = ",".join(c.strip() for c in profile.courses if c.strip())
        # Also dynamically seed courses since they act as skills for university view
        for c in profile.courses:
            ensure_skill_exists(db, c)

    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)
