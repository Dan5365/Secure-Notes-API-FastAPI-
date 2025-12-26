from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_client import get_current_user
from crud import get_notes, get_note_by_id, update_note, delete_note, create_note
from database import get_db
from schemas import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/", response_model=List[NoteResponse])
def read_notes(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_notes(current_user["user_id"], db)



@router.get("/{note_id}", response_model=NoteResponse)
def read_note_by_id(
    note_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = get_note_by_id(note_id, current_user["user_id"], db)
    if not note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return note



@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_note(current_user["user_id"], note, db)



@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_note = update_note(
        note_id,
        current_user["user_id"],
        db,
        title=note.title,
        content=note.content
    )
    if not updated_note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return updated_note



@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_note(note_id, current_user["user_id"], db)
    if not success:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return {"detail": "Заметка удалена"}
