import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account"
)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Creates a new user account with secure password hashing and returns an authenticated token."""
    email_clean = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    # Ensure unique username
    base_name = payload.name.strip()
    username = base_name
    conflict = db.query(User).filter(User.username == username).first()
    if conflict:
        username = f"{base_name}_{secrets.token_hex(2)}"

    hashed = hash_password(payload.password)
    new_user = User(
        username=username,
        email=email_clean,
        hashed_password=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return AuthResponse(
        user=UserResponse(
            id=new_user.id,
            name=new_user.username,
            email=new_user.email,
            created_at=new_user.created_at
        ),
        token=token,
        message="Account created successfully."
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in to user account"
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Verifies credentials against hashed password and returns an authenticated token."""
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials and try again."
        )

    token = create_access_token(user.id)
    return AuthResponse(
        user=UserResponse(
            id=user.id,
            name=user.username,
            email=user.email,
            created_at=user.created_at
        ),
        token=token,
        message="Signed in successfully."
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile"
)
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Returns profile for currently authenticated user via Bearer token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required."
        )

    user_id = verify_access_token(authorization)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or token invalid. Please sign in again."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )

    return UserResponse(
        id=user.id,
        name=user.username,
        email=user.email,
        created_at=user.created_at
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Sign out from session"
)
def logout():
    """Logs out the active session."""
    return {"message": "Logged out successfully."}
