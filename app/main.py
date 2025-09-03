from fastapi import FastAPI
from app.api import auth

app = FastAPI(title="Proyecto tecnico")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def read_root():
    """
    Endpoint de bienvenida para verificar que la API está funcionando.
    """
    return {"mensaje": "¡Bienvenido a la API de Evaluación de Proveedores!"}