import uuid

from sqlalchemy import select
from sqlalchemy.orm import Query
from sqlalchemy.orm import Session
from app.models import company as company_model
from app.schemas import company as company_schema


def get_companies(db: Session, skip: int = 0, limit: int = 10, search: str | None = None) -> tuple[list[company_model.Company], int]:
    """
    Obtiene una lista paginada de compañías, con opción de búsqueda.
    """
    query: Query = db.query(company_model.Company)

    if search:
        query = query.filter(company_model.Company.name.ilike(f"%{search}%"))

    total = query.count()
    companies = query.offset(skip).limit(limit).all()
    return companies, total

def get_company_by_id(db: Session, company_id: uuid.UUID) -> company_model.Company | None:
    """
    Busca una compañía por su ID.
    """
    return db.query(company_model.Company).filter(company_model.Company.id == company_id).first()


def get_company_by_name(db: Session, name: str) -> company_model.Company | None:
    """
    Busca una compañía por su nombre en la base de datos.
    """
    return db.query(company_model.Company).filter(company_model.Company.name == name).first()


def create_company(db: Session, company: company_schema.CompanyCreate) -> company_model.Company:
    """
    Crea una nueva compañía en la base de datos.
    """
    db_company = company_model.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def update_company(db: Session, company: company_model.Company, company_in: company_schema.CompanyUpdate) -> company_model.Company:
    """
    Actualiza los datos de una compañía en la base de datos.
    """
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.add(company)
    db.commit()
    db.refresh(company)
    return company

def delete_company(db: Session, company: company_model.Company) -> None:
    """
    Elimina una compañía de la base de datos.
    """
    db.delete(company)
    db.commit()