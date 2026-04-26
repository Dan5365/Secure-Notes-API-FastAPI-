from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, Depends
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware

from notes_service.auth_client import get_current_user
from notes_service.database import create_table
from notes_service.routers.notes import router as notes_router

instrumentator = Instrumentator()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_table()
    instrumentator.expose(app)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

instrumentator.instrument(app)

app.include_router(notes_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)