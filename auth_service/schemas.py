
from pydantic import BaseModel, Field


class UserSchema(BaseModel):
    id: int
    username: str = Field(..., min_length=3, max_length=30)
    age: int = Field(..., ge=0, le=120)
    password_hash: str



class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    age: int = Field(..., ge=0, le=120)
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    age: int



