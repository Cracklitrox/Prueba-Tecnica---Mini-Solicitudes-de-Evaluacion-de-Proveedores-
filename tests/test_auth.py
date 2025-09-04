from fastapi.testclient import TestClient

def test_register_user_success(client: TestClient):
    """
    Prueba el registro exitoso de un nuevo usuario.
    """
    response = client.post(
        "/auth/register",
        json={"email": "testeo@gmail.com", "password": "testPassword123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testeo@gmail.com"
    assert "id" in data
    assert "password_hash" not in data

def test_register_existing_user_fails(client: TestClient):
    """
    Prueba que el registro falla si el email ya existe.
    """
    client.post(
        "/auth/register",
        json={"email": "testeo2@gmail.com", "password": "testPassword123"},
    )
    response = client.post(
        "/auth/register",
        json={"email": "testeo2@gmail.com", "password": "testPassword123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "El email/usuario ya está registrado"

def test_login_success(client: TestClient):
    """
    Prueba el login exitoso y la obtención de un token.
    """
    client.post(
        "/auth/register",
        json={"email": "testeo@gmail.com", "password": "testPassword123"},
    )
    
    response = client.post(
        "/auth/login",
        data={"username": "testeo@gmail.com", "password": "testPassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"