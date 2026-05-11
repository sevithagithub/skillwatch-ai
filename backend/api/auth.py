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
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
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
    if profile.courses is not None:
        current_user.courses = ",".join(c.strip() for c in profile.courses if c.strip())

    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)
