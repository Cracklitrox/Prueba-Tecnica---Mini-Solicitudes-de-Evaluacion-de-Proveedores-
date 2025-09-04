import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CompanyBase(BaseModel):
    name: str
    tax_id: str | None = None
    country: str = "CL"

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    pass

class CompanyRead(CompanyBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)