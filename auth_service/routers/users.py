from typing import List

from fastapi import APIRouter, Depends
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select


import sys
import os

from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth import create_token, get_current_admin, get_creator
from crud import get_users, pwd_context, get_user_by_username, create_user
from database import get_db
from models import UserModel
from schemas import UserResponse, UserCreate
router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse)
def user_register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(user.username, db)
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    new_user = create_user(db, user)
    return new_user


@router.post("/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(form_data.username, db)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный username или пароль")

    if not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный username или пароль")

    token = create_token(user)

    return token


@router.get("/users", response_model=List[UserResponse])
def read_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return get_users(db)


@router.get("/users/by-username/{username}", response_model=UserResponse)
def read_user_by_username(username: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@router.post("/users/{user_id}/make-admin")
def make_admin(user_id: int, db: Session = Depends(get_db), creator=Depends(get_creator)):
    stmt = select(UserModel).where(UserModel.id == user_id)
    user = db.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.role = "admin"
    db.commit()
    return {"message": f"{user.username} теперь админ"}
