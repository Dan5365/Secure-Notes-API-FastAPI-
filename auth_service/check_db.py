import asyncio
from auth_service.database import engine, Base
from sqlalchemy import text


async def test_connection():
    print("🚀 Начинаем проверку базы данных...")
    try:
        # 1. Проверяем само подключение через простейший SQL-запрос
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("🔗 Подключение к движку: УСПЕШНО")

        # 2. Пробуем создать таблицы (Base.metadata.create_all)
        async with engine.begin() as conn:
            # run_sync позволяет запустить синхронный метод создания таблиц в асинхронной среде
            await conn.run_sync(Base.metadata.create_all)
            print("🏗️ Создание таблиц: УСПЕШНО")

        print("🎉 Всё работает! Теперь можно смело переходить к CRUD.")

    except Exception as e:
        print(f"❌ Произошла ошибка: {e}")


if __name__ == "__main__":
    asyncio.run(test_connection())