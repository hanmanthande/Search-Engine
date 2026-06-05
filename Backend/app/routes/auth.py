import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegister, UserLogin, UserOut,
    TokenResponse, TokenRefreshRequest, TokenRefreshResponse,
)
from app.services.auth_service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_refresh_token, get_current_user,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "An account with this email already exists.")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(400, "This username is already taken.")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_data = {"sub": str(user.id)}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password.")
    if not user.is_active:
        raise HTTPException(403, "Your account has been disabled.")

    token_data = {"sub": str(user.id)}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
def refresh_token(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    token_payload = decode_refresh_token(payload.refresh_token)
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or disabled")
    return TokenRefreshResponse(access_token=create_access_token({"sub": str(user.id)}))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user