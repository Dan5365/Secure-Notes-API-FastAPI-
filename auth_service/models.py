from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import String, CheckConstraint
from auth_service.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    password_hash: Mapped[str]
    age: Mapped[int] = mapped_column(CheckConstraint('age >= 0 and age <= 120'))
    role: Mapped[str] = mapped_column(default="user")
