import uuid
from datetime import datetime
from pydantic import BaseModel, Field

# Importación de schema Company para anidación
from .company import CompanyRead

class RiskInputsSchema(BaseModel):
    pep_flag: bool = False
    sanction_list: bool = False
    late_payments: int = Field(0, ge=0) # ge=0 significa "mayor o igual a 0"

class RequestCreate(BaseModel):
    company_id: uuid.UUID
    risk_inputs: RiskInputsSchema

class RequestUpdate(BaseModel):
    status: str | None = None
    risk_inputs: RiskInputsSchema | None = None

class RequestRead(BaseModel):
    id: uuid.UUID
    status: str
    risk_inputs: RiskInputsSchema | None
    risk_score: int | None
    created_at: datetime
    company: CompanyRead

    class Config:
        from_attributes = True