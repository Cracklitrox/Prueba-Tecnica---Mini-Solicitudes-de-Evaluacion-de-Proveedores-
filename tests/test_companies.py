from fastapi.testclient import TestClient

# --- Helper ---
def get_auth_token(client: TestClient) -> str:
    client.post("/auth/register", json={"email": "companies_test@example.com", "password": "password"})

    response = client.post("/auth/login", data={"username": "companies_test@example.com", "password": "password"})
    
    token_data = response.json()
    return token_data["access_token"]


# Pruebas
def test_create_company_unauthenticated(client: TestClient):
    """
    Prueba que un usuario sin token no puede crear una compañía.
    """
    response = client.post("/companies/", json={"name": "Test Company"})
    assert response.status_code == 401

def test_create_company_authenticated(client: TestClient):
    """
    Prueba que un usuario autenticado SÍ puede crear una compañía.
    """
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    company_data = {"name": "Authenticated Test Corp", "tax_id": "123-456"}
    response = client.post("/companies/", headers=headers, json=company_data)
    
    assert response.status_code == 201 # Usamos 201 Created
    data = response.json()
    assert data["name"] == company_data["name"]

def test_read_companies(client: TestClient):
    """
    Prueba que podemos listar las compañías creadas.
    """
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Creamos una compañía primero para asegurarnos de que hay algo en la lista
    client.post("/companies/", headers=headers, json={"name": "Company to List"})
    
    # Ahora pedimos la lista
    response = client.get("/companies/", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["name"] == "Company to List"