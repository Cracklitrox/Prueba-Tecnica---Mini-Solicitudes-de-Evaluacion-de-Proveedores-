import uuid
from sqlalchemy.orm import Session
from app.models import request as request_model
from app.schemas import request as request_schema
from app.services import risk as risk_service
from sqlalchemy.orm import joinedload
from app.models import company as company_model, enums as enums_model


def create_request(db: Session, request_in: request_schema.RequestCreate) -> request_model.Request:
    """
    Crea una nueva solicitud de evaluación, calculando su risk_score.
    """
    risk_score = risk_service.calculate_risk_score(request_in.risk_inputs)

    db_request = request_model.Request(
        company_id=request_in.company_id,
        risk_inputs=request_in.risk_inputs.model_dump(),
        risk_score=risk_score
    )

    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_requests(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    search: str | None = None,
    status: enums_model.StatusRequestEnum | None = None,
    risk_min: int | None = None,
    risk_max: int | None = None
) -> tuple[list[request_model.Request], int]:
    """
    Obtiene una lista paginada de solicitudes, con filtros.
    """
    query = db.query(request_model.Request).options(joinedload(request_model.Request.company))

    if search:
        query = query.join(company_model.Company).filter(company_model.Company.name.ilike(f"%{search}%"))

    # --- AÑADE ESTA LÓGICA DE FILTROS ---
    if status:
        query = query.filter(request_model.Request.status == status)
    if risk_min is not None:
        query = query.filter(request_model.Request.risk_score >= risk_min)
    if risk_max is not None:
        query = query.filter(request_model.Request.risk_score <= risk_max)
    # ------------------------------------

    total = query.count()

    requests = (
        query.order_by(request_model.Request.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return requests, total


def get_request_by_id(db: Session, request_id: uuid.UUID) -> request_model.Request | None:
    """
    Busca una solicitud por su ID.
    """
    return db.query(request_model.Request).filter(request_model.Request.id == request_id).first()



def update_request(db: Session, request: request_model.Request, request_in: request_schema.RequestUpdate) -> request_model.Request:
    """
    Actualiza los datos de una solicitud. Si se actualizan los risk_inputs, recalcula el risk_score.
    """
    update_data = request_in.model_dump(exclude_unset=True)

    # Si 'risk_inputs' está en los datos a actualizar, recalculamos el score
    if 'risk_inputs' in update_data:
        risk_score = risk_service.calculate_risk_score(request_schema.RiskInputsSchema(**update_data['risk_inputs']))
        request.risk_score = risk_score

    # Actualizamos el resto de los campos
    for field, value in update_data.items():
        setattr(request, field, value)

    db.add(request)
    db.commit()
    db.refresh(request)
    return request



def delete_request(db: Session, request: request_model.Request) -> None:
    """
    Elimina una solicitud de la base de datos.
    """
    db.delete(request)
    db.commit()