from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user as user_schema
from app.services import security as security_service

def get_user_by_email(db: Session, email: str) -> user_model.User | None:
    """
    Busca un usuario por su email en la base de datos.
    """
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate) -> user_model.User:
    """
    Crea un nuevo usuario en la base de datos.
    """
    hashed_password = security_service.get_password_hash(user.password)
    db_user = user_model.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user