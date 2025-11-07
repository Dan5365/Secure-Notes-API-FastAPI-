import uvicorn
from fastapi import FastAPI

from crud import create_user, get_user_by_username
from database import SessionLocal, create_table


from routers.notes import router as notes_router
from schemas import UserCreate

# python main.py
app = FastAPI()

create_table()

app.include_router(notes_router)


def init_creator():
    """
      Однократная функция для создания пользователя 'Создатель' с ролью 'creator'.
      После того как пользователь создан, этот код можно закомментировать или удалить.
      """
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


# init_creator()

@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
