from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import user as user_schema
from app.services import user_service
from app.services import security as security_service
from app.api.deps import get_db
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=user_schema.UserRead)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar un nuevo usuario.
    """
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    new_user = user_service.create_user(db=db, user=user)
    return new_user

@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Endpoint para iniciar sesión y obtener un token de acceso.
    """
    user = user_service.get_user_by_email(db, email=form_data.username)

    if not user or not security_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security_service.create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return {"access_token": access_token, "token_type": "bearer"}