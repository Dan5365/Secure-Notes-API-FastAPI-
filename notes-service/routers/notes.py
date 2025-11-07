from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth import get_current_user
from crud import get_notes, get_note_by_id, update_note, delete_note, create_note
from database import get_db
from models import UserModel
from schemas import NoteCreate, NoteUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def read_notes(authorization: str = Header(None), db=Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token required")
    token = authorization.split(" ")[1]
    user = get_current_user(token)
    return get_notes(user["user_id"], db)

@router.get("/notes")
def read_notes(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    return get_notes(current_user.id, db)


@router.get("/notes/{note_id}")
def read_note_by_id(
        note_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    note = get_note_by_id(note_id, current_user.id, db)
    if not note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return note


@router.post("/notes")
def create_note_endpoint(note: NoteCreate, db: Session = Depends(get_db),
                         current_user: UserModel = Depends(get_current_user)):
    return create_note(current_user.id, note, db)


@router.put("/notes/{note_id}")
def update_note_endpoint(
        note_id: int,
        note: NoteUpdate,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    return update_note(note_id, current_user.id, db, title=note.title, content=note.content)


@router.delete("/notes/{note_id}")
def delete_note_endpoint(note_id: int, db: Session = Depends(get_db),
                         current_user: UserModel = Depends(get_current_user)):
    return delete_note(note_id, current_user.id, db)
