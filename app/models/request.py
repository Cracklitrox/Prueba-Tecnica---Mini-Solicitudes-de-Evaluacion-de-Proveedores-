import uuid
from sqlalchemy import String, Integer, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db import Base

# Evita problemas de importación circular
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .company import Company

class Request(Base):
    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    risk_inputs: Mapped[dict | None] = mapped_column(JSON)
    risk_score: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Esta relación le permite a SQLAlchemy acceder al objeto 'Company' completo desde una 'Request'
    company: Mapped["Company"] = relationship(back_populates="requests")