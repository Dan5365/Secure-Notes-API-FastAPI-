import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyQuery
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi import Depends, HTTPException, status

from auth_service.crud import create_user, get_user_by_username
from auth_service.database import SessionLocal, create_table

from auth_service.routers.users import router as users_router
from auth_service.auth import router as auth_router
from auth_service.schemas import UserCreate

# python main.py
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_table()

app.include_router(users_router)
app.include_router(auth_router)


def init_creator():

    create_table()
    db = SessionLocal()
    try:
        existing = get_user_by_username("Создатель", db)
        if not existing:
            creator_user = UserCreate(username="Создатель", password="supersecret", age=30)
            create_user(db, creator_user, role="creator")
    finally:
        db.close()


"""
При надобности разкомментируйте эту функцию
"""
init_creator()

@app.get("/")
async def root():
    return {"message": "Auth-Service"}


API_KEY = "DanmurKey"
API_KEY_NAME = "key"
api_key_query = APIKeyQuery(name=API_KEY_NAME, auto_error=False)


async def get_api_key(api_key: str = Depends(api_key_query)):
    if api_key == API_KEY:
        return api_key
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверный ключ доступа к документации",
    )


@app.get("/docs", include_in_schema=False)
async def get_docs(api_key: str = Depends(get_api_key)):
    return get_swagger_ui_html(openapi_url=app.openapi_url, title="Документация API")


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
