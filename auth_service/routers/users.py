from typing import List

from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy import select

import sys
import os

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth_service.auth import create_token, get_current_admin, get_creator
from auth_service.crud import get_users, pwd_context, get_user_by_username, create_user, delete_user
from auth_service.database import get_db_session
from auth_service.models import UserModel
from auth_service.schemas import UserResponse, UserCreate
router = APIRouter(tags=["Users"])


@router.get("/users", response_model=List[UserResponse])
async def get_users_endpoint(db: AsyncSession = Depends(get_db_session), admin=Depends(get_current_admin)):
    users = await get_users(db)
    return users


@router.get("/users/{username}", response_model=UserResponse)
async def get_user_by_username_endpoint(username: str, db: AsyncSession = Depends(get_db_session), admin=Depends(get_current_admin)):
    user = await get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.post("/users")
async def create_user_endpoint(user: UserCreate, role:str = "user",
                         db: AsyncSession = Depends(get_db_session)):
    existing_user = await get_user_by_username(user.username, db)
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Это имя уже занято")
    new_user = await create_user(db, user, role=role)
    return new_user

@router.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: int, db: AsyncSession = Depends(get_db_session), admin=Depends(get_current_admin)):
    success = await delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return {"message": "Пользователь удалён"}

@router.post("/users/{user_id}/make-admin")
async def make_admin(user_id: int, db: AsyncSession = Depends(get_db_session), creator=Depends(get_creator)):
    stmt = select(UserModel).where(UserModel.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.role = "admin"
    await db.commit()
    return {"message": f"{user.username} теперь админ"}

