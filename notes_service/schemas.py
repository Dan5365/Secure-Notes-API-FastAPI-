import datetime

from pydantic import BaseModel, Field


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


class NoteResponse(NoteSchema):
    pass
