from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.db.db import SessionLocal
from app.models import user as user_model
from app.services import user_service

# Configuración del esquema OAuth2 para la autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    """
    Crea una sesión de base de datos para una petición y se asegura de cerrarla siempre.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> user_model.User:
    """
    Dependencia para obtener el usuario actual a partir de un token JWT.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = user_service.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user