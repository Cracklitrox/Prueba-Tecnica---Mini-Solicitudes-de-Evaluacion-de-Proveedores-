from fastapi.testclient import TestClient
from app.services.risk import calculate_risk_score
from app.schemas.request import RiskInputsSchema


# --- Helper ---
def setup_for_requests_test(client: TestClient) -> tuple[dict, str]:
    """
    Helper para crear un usuario y una compañía, y devolver un token y el ID de la compañía.
    """
    client.post("/auth/register", json={"email": "requests_test@example.com", "password": "password"})
    login_resp = client.post("/auth/login", data={"username": "requests_test@example.com", "password": "password"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    company_resp = client.post("/companies/", headers=headers, json={"name": "Test Co for Requests"})
    company_id = company_resp.json()["id"]
    
    return headers, company_id


# Pruebas
def test_create_request_success(client: TestClient):
    """
    Prueba la creación exitosa de una solicitud y verifica el cálculo del risk_score.
    """
    headers, company_id = setup_for_requests_test(client)
    
    request_data = {
        "company_id": company_id,
        "risk_inputs": {"pep_flag": True, "sanction_list": False, "late_payments": 1} # Esperable Score actualizado a 70
    }
    
    response = client.post("/requests/", headers=headers, json=request_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["company"]["id"] == company_id
    assert data["risk_score"] == 70

def test_read_requests_success(client: TestClient):
    """
    Prueba que se puede listar solicitudes y que la info de la compañía viene incluida (joinedload).
    """
    headers, company_id = setup_for_requests_test(client)
    
    request_data = {
        "company_id": company_id,
        "risk_inputs": {"pep_flag": False, "sanction_list": False, "late_payments": 0}
    }
    client.post("/requests/", headers=headers, json=request_data)
    
    response = client.get("/requests/", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert "company" in data["items"][0]
    assert data["items"][0]["company"]["id"] == company_id



# Test unitarios

def test_calculate_risk_score_base():
    """Prueba que el puntaje base es 0 si no hay riesgos."""
    inputs = RiskInputsSchema(pep_flag=False, sanction_list=False, late_payments=0)
    score = calculate_risk_score(inputs)
    assert score == 0

def test_calculate_risk_score_with_pep():
    """Prueba que pep_flag suma 60 puntos."""
    inputs = RiskInputsSchema(pep_flag=True, sanction_list=False, late_payments=0)
    score = calculate_risk_score(inputs)
    assert score == 60

def test_calculate_risk_score_with_sanction():
    """Prueba que sanction_list suma 40 puntos."""
    inputs = RiskInputsSchema(pep_flag=False, sanction_list=True, late_payments=0)
    score = calculate_risk_score(inputs)
    assert score == 40

def test_calculate_risk_score_late_payments_cap():
    """Prueba que el puntaje de late_payments tiene un tope de 30."""
    inputs = RiskInputsSchema(pep_flag=False, sanction_list=False, late_payments=5)
    score = calculate_risk_score(inputs)
    assert score == 30

def test_calculate_risk_score_all_risks():
    """Prueba la suma de todos los riesgos."""
    inputs = RiskInputsSchema(pep_flag=True, sanction_list=True, late_payments=2)
    score = calculate_risk_score(inputs)
    assert score == 120


def test_create_request_for_non_existent_company(client: TestClient):
    """
    Prueba que crear una solicitud para una compañía que no existe devuelve 404.
    """
    headers, _ = setup_for_requests_test(client)

    non_existent_company_id = "f809f68a-7e0b-4e3f-8c8a-1c8f6b0a7e0b"
    request_data = {
        "company_id": non_existent_company_id,
        "risk_inputs": {"pep_flag": False, "sanction_list": False, "late_payments": 0}
    }

    response = client.post("/requests/", headers=headers, json=request_data)

    assert response.status_code == 404