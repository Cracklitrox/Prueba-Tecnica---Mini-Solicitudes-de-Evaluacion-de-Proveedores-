from fastapi import FastAPI
from app.api import auth, companies

app = FastAPI(title="API de Evaluación de Proveedores")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(companies.router, prefix="/companies", tags=["Companies"])


@app.get("/")
def read_root():
    """
    Endpoint de bienvenida para verificar que la API está funcionando.
    """
    return {"mensaje": "¡Bienvenido a la API de Evaluación de Proveedores!"}