import jwt
from fastapi import Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from auth_service.crud import get_user_by_username, create_user, pwd_context
from auth_service.database import get_db_session
from auth_service.models import UserModel
from auth_service.schemas import UserSchema, UserResponse, UserCreate

SECRET_KEY = "my_super_secret_key"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# taskkill /F /IM python.exe
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
def user_register(user: UserCreate, db: Session = Depends(get_db_session)):
    existing_user = get_user_by_username(user.username, db)
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    new_user = create_user(db, user)
    return new_user


@router.post("/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db_session)):
    user = get_user_by_username(form_data.username, db)
    print("USERNAME:", form_data.username)
    print("PASSWORD:", form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный username или пароль")

    if not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный username или пароль")

    token = create_token(user)

    return token

def create_token(user: UserSchema):
    encoded = jwt.encode({"sub": user.username, "role": user.role}, SECRET_KEY, algorithm="HS256")
    return {"access_token": encoded, "token_type": "bearer"}


def decode_and_get_user(token: str, db: Session) -> UserModel:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Невалидный токен")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Невалидный токен")

    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="Невалидный токен")

    return user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db_session)
) -> UserModel:
    return decode_and_get_user(token, db)


@router.get("/verify-token")
def verify_token(token: str, db: Session = Depends(get_db_session)):
    user = decode_and_get_user(token, db)
    return {"user_id": user.id, "username": user.username, "role": user.role}

def get_current_admin(user: UserModel = Depends(get_current_user)):
    if user.role not in ["admin", "creator"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


def get_creator(user: UserModel = Depends(get_current_user)):
    if user.role != "creator":
        raise HTTPException(status_code=403, detail="У вас нет прав Создателя")
    return user



















