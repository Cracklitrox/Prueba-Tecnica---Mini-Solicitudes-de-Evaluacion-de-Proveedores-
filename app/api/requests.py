from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import uuid
from app.api import deps
from app.models import user as user_model
from app.schemas import request as request_schema
from app.schemas.common import PaginatedResponse
from app.schemas.request import RequestRead
from app.services import request_service, company_service

router = APIRouter()


@router.post("/", response_model=request_schema.RequestRead, status_code=201)
def create_request(
    *,
    db: Session = Depends(deps.get_db),
    request_in: request_schema.RequestCreate,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para crear una nueva solicitud de evaluación.
    """
    # Verificación: Asegurarse de que la compañía para la que se crea la solicitud existe.
    company = company_service.get_company_by_id(db, company_id=request_in.company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="La compañía especificada no existe.",
        )

    new_request = request_service.create_request(db=db, request_in=request_in)
    return new_request


@router.get("/", response_model=PaginatedResponse[RequestRead])
def read_requests(
    db: Session = Depends(deps.get_db),
    page: int = 1,
    page_size: int = 10,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para listar solicitudes con paginación.
    """
    skip = (page - 1) * page_size
    requests, total = request_service.get_requests(db, skip=skip, limit=page_size)

    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=requests
    )


@router.put("/{request_id}", response_model=request_schema.RequestRead)
def update_request_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    request_id: uuid.UUID,
    request_in: request_schema.RequestUpdate,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para actualizar una solicitud existente.
    """
    request = request_service.get_request_by_id(db, request_id=request_id)
    if not request:
        raise HTTPException(
            status_code=404,
            detail="La solicitud con este ID no existe.",
        )

    updated_request = request_service.update_request(db=db, request=request, request_in=request_in)
    return updated_request


@router.delete("/{request_id}", status_code=204)
def delete_request_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    request_id: uuid.UUID,
    current_user: user_model.User = Depends(deps.get_current_user)
):
    """
    Endpoint para eliminar una solicitud.
    """
    request = request_service.get_request_by_id(db, request_id=request_id)
    if not request:
        raise HTTPException(
            status_code=404,
            detail="La solicitud con este ID no existe.",
        )

    request_service.delete_request(db=db, request=request)
    return None