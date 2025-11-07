import datetime

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


class NoteSchema(BaseModel):
    id: int
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)


class NoteUpdate(NoteCreate):
    pass


class NoteResponse(NoteCreate):
    pass
