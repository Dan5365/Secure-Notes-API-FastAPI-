from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from database import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str]
    password_hash: Mapped[str]
    age: Mapped[int]
    role: Mapped[str] = mapped_column(default="user")


