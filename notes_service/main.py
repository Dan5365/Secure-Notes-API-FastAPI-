import uvicorn
from fastapi import FastAPI, Depends

from notes_service.auth_client import get_current_user
from notes_service.database import create_table
from fastapi.middleware.cors import CORSMiddleware

from notes_service.routers.notes import router as notes_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


create_table()


app.include_router(notes_router)


@app.get("/test")
def test():
    return {"message": "Notes service works"}

@app.get("/test-auth")
def test_auth(user = Depends(get_current_user)):
    return {"message": "Auth works", "user": user}

@app.get("/")
async def root():
    return {"message": "Notes Service"}

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, port=8001)