import uuid
from sqlalchemy import String, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    tax_id: Mapped[str | None] = mapped_column(String(50)) # Union[str, None]
    country: Mapped[str] = mapped_column(String(2), default="CL", nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True)) # Para soft delete

    requests: Mapped[list["Request"]] = relationship(back_populates="company")