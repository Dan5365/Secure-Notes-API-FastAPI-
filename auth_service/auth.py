import jwt
from fastapi import Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from crud import get_user_by_username
from database import get_db
from models import UserModel
from schemas import UserSchema

SECRET_KEY = "my_super_secret_key"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

router = APIRouter(prefix="/auth", tags=["Auth"])

def create_token(user: UserSchema):
    encoded = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm="HS256")
    return {"access_token": encoded, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_username(username, db)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def get_current_admin(user: UserModel = Depends(get_current_user)):
    if user.role not in ["admin", "creator"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


def get_creator(user: UserModel = Depends(get_current_user)):
    if user.role != "creator":
        raise HTTPException(status_code=403, detail="Только Создатель может")
    return user


@router.get("/verify-token")
def verify_token(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user_id": user.id, "username": user.username, "role": user.role}
















