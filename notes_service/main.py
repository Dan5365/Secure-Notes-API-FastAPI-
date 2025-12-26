import uvicorn
from fastapi import FastAPI
from database import create_table

from routers.notes import router as notes_router


# python main.py
app = FastAPI()

create_table()

app.include_router(notes_router)



@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
