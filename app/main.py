from fastapi import FastAPI

app = FastAPI(title="Proyecto tecnico")

@app.get("/")
def read_root():
    """
    Endpoint de bienvenida para verificar que la API está funcionando.
    """
    return {"mensaje": "¡El entorno está funcionando correctamente!"}