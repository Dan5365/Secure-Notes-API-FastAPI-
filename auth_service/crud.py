from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.models import UserModel
from auth_service.schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_users(db: AsyncSession):
    stmt = select(UserModel)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users


async def get_user_by_username(username: str, db: AsyncSession):
    stmt = select(UserModel).where(UserModel.username == username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    return user


async def create_user(db: AsyncSession, user: UserCreate, role: str = "user"):
    hashed_password = pwd_context.hash(user.password)
    new_user = UserModel(
        username=user.username,
        age=user.age,
        password_hash=hashed_password,
        role=role
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def delete_user(db: AsyncSession, user_id: int):
    stmt = select(UserModel).where(UserModel.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user is None:
        return False
    await db.delete(user)
    await db.commit()
    return True
