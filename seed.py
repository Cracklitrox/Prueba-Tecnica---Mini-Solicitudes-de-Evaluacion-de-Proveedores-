import uuid
from app.db import SessionLocal
from app.services import user_service, company_service, request_service
from app.schemas.user import UserCreate
from app.schemas.company import CompanyCreate
from app.schemas.request import RequestCreate, RiskInputsSchema

def seed_data():
    """
    Puebla la base de datos con datos iniciales si está vacía.
    """
    db = SessionLocal()
    try:
        # --- 1. Crear Usuario Admin ---
        print("Verificando usuario admin...")
        admin_user = user_service.get_user_by_email(db, email="administrador@ejemplo.com")
        if not admin_user:
            user_in = UserCreate(email="administrador@ejemplo.com", password="admin123")
            user_service.create_user(db=db, user=user_in)
            print("Usuario admin creado.")
        else:
            print("Usuario admin ya existe.")

        # --- 2. Crear Compañías ---
        print("\nVerificando compañías...")
        companies_to_create = [
            CompanyCreate(name="Fruna", tax_id="76.123.456-7", country="CL"),
            CompanyCreate(name="Dr. Simi", tax_id="88.888.888-8", country="CL"),
            CompanyCreate(name="Empresa Chilena", tax_id="99.248.412-K", country="CL"),
            CompanyCreate(name="Empresa Extranjera", tax_id=None, country="US"),
        ]
        
        created_companies = {}
        for company_data in companies_to_create:
            company = company_service.get_company_by_name(db, name=company_data.name)
            if not company:
                company = company_service.create_company(db, company=company_data)
                print(f"Compañía '{company.name}' creada.")
            else:
                print(f"Compañía '{company.name}' ya existe.")
            created_companies[company.name] = company

        # --- 3. Crear Solicitudes ---
        print("\nVerificando solicitudes...")
        # Asegurarnos de que no hay solicitudes para evitar duplicados
        requests, total = request_service.get_requests(db, skip=0, limit=1)
        if total == 0:
            print("Creando solicitudes de ejemplo...")
            requests_to_create = [
                RequestCreate(company_id=created_companies["Fruna"].id, risk_inputs=RiskInputsSchema(pep_flag=True, sanction_list=False, late_payments=0)),
                RequestCreate(company_id=created_companies["Dr. Simi"].id, risk_inputs=RiskInputsSchema(pep_flag=False, sanction_list=True, late_payments=1)),
                RequestCreate(company_id=created_companies["Empresa Chilena"].id, risk_inputs=RiskInputsSchema(pep_flag=False, sanction_list=False, late_payments=3)),
                RequestCreate(company_id=created_companies["Empresa Extranjera"].id, risk_inputs=RiskInputsSchema(pep_flag=True, sanction_list=True, late_payments=3)),
            ]
            for req_data in requests_to_create:
                request_service.create_request(db, request_in=req_data)
            print("Solicitudes de ejemplo creadas.")
        else:
            print("Las solicitudes de ejemplo ya existen.")

        print("\n¡Seed completado!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_data()