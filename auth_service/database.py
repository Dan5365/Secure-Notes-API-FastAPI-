import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

if os.getenv("DOCKER_MODE"):
    DB_PATH = "/app/data/users.db"
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    DB_PATH = os.path.join(DATA_DIR, "users.db")



engine = create_async_engine(f"sqlite+aiosqlite:///{DB_PATH}")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db_session():
    async with AsyncSessionLocal() as session:
        yield session

class Base(DeclarativeBase):
    pass