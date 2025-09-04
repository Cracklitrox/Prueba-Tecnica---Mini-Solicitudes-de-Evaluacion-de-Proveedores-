import uuid
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="analyst", nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())