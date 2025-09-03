from app.db import SessionLocal

def get_db():
    """
    Crea una sesión de base de datos para una petición y se asegura de cerrarla siempre.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()