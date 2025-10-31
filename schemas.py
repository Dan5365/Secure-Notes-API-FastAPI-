import datetime

from pydantic import BaseModel, Field


class UserSchema(BaseModel):
    id: int
    username: str
    age: int
    password_hash: str


class UserCreate(BaseModel):
    username: str
    age: int
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    age: int


class NoteSchema(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteUpdate(NoteCreate):
    pass


class NoteResponse(NoteCreate):
    pass
