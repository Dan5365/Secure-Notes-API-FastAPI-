
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import UserModel
from schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_users(db: Session):
    stmt = select(UserModel)
    users = db.execute(stmt).scalars().all()
    return users


def get_user_by_username(username: str, db: Session):
    stmt = select(UserModel).where(UserModel.username == username)
    user = db.execute(stmt).scalars().first()
    return user


def create_user(db: Session, user: UserCreate, role: str = "user"):
    hashed_password = pwd_context.hash(user.password)
    new_user = UserModel(
        username=user.username,
        age=user.age,
        password_hash=hashed_password,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



