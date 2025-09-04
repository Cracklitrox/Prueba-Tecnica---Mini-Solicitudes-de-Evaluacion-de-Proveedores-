from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import uuid

from app.api import deps
from app.models import user as user_model
from app.schemas import company as company_schema
from app.services import company_service

from app.schemas.common import PaginatedResponse
from app.schemas.company import CompanyRead

router = APIRouter()

@router.post("/", response_model=company_schema.CompanyRead, status_code=201)
def create_company(
    *,
    db: Session = Depends(deps.get_db),
    company_in: company_schema.CompanyCreate,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para crear una nueva compañía. Solo para usuarios autenticados.
    """
    company = company_service.get_company_by_name(db, name=company_in.name)
    if company:
        raise HTTPException(
            status_code=400,
            detail="Una compañía con este nombre ya existe, pruebe con otro nombre.",
        )

    new_company = company_service.create_company(db=db, company=company_in)
    return new_company


@router.get("/", response_model=PaginatedResponse[CompanyRead])
def read_companies(
    db: Session = Depends(deps.get_db),
    page: int = 1,
    page_size: int = 10,
    q: str | None = None,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para listar compañías con paginación y búsqueda.
    Solo para usuarios autenticados.
    """
    skip = (page - 1) * page_size
    companies, total = company_service.get_companies(db, skip=skip, limit=page_size, search=q)

    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=companies
    )


@router.put("/{company_id}", response_model=company_schema.CompanyRead)
def update_company_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    company_id: uuid.UUID,
    company_in: company_schema.CompanyUpdate,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para actualizar una compañía existente.
    """
    company = company_service.get_company_by_id(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="La compañía con este ID no existe.",
        )

    updated_company = company_service.update_company(db=db, company=company, company_in=company_in)
    return updated_company


@router.delete("/{company_id}", status_code=204)
def delete_company_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    company_id: uuid.UUID,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para eliminar una compañía.
    """
    company = company_service.get_company_by_id(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="La compañía con este ID no existe.",
        )

    company_service.delete_company(db=db, company=company)
    return None


@router.get("/{company_id}", response_model=company_schema.CompanyRead)
def read_single_company(
    *,
    db: Session = Depends(deps.get_db),
    company_id: uuid.UUID,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para obtener los detalles de una sola compañía por su ID.
    """
    company = company_service.get_company_by_id(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="La compañía con este ID no existe.",
        )
    return company