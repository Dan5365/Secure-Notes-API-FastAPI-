from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from auth_client import get_current_user
from crud import get_notes, get_note_by_id, update_note, delete_note, create_note
from database import get_db
from schemas import NoteCreate, NoteUpdate

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/")
def read_notes(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_notes(current_user["id"], db)


@router.get("/{note_id}")
def read_note_by_id(
    note_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = get_note_by_id(note_id, current_user["id"], db)
    if not note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return note


@router.post("/")
def create_note_endpoint(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_note(current_user["id"], note, db)


@router.put("/{note_id}")
def update_note_endpoint(
    note_id: int,
    note: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_note = update_note(note_id, current_user["id"], db, title=note.title, content=note.content)
    if not updated_note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return updated_note


@router.delete("/{note_id}")
def delete_note_endpoint(
    note_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_note(note_id, current_user["id"], db)
    if not success:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return {"detail": "Заметка удалена"}
