from sqlalchemy import select
from sqlalchemy.orm import Session

from notes_service.models import NoteModel
from notes_service.schemas import NoteCreate


def get_notes(user_id: int, db: Session):
    stmt = select(NoteModel).where(NoteModel.owner_id == user_id)
    notes = db.execute(stmt).scalars().all()
    return notes


def get_note_by_id(note_id: int, user_id: int, db: Session):
    stmt = select(NoteModel).where(
        NoteModel.id == note_id, NoteModel.owner_id == user_id)
    note = db.execute(stmt).scalars().first()

    return note


def create_note(user_id: int, note: NoteCreate, db: Session):
    new_note = NoteModel(
        title=note.title,
        content=note.content,
        owner_id=user_id
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


def update_note(note_id: int, user_id: int, db: Session, title: str = None, content: str = None):
    stmt = select(NoteModel).where(NoteModel.id == note_id, NoteModel.owner_id == user_id)
    note = db.execute(stmt).scalars().first()
    if not note:
        return None
    if title is not None:
        note.title = title
    if content is not None:
        note.content = content

    db.commit()
    db.refresh(note)
    return note


def delete_note(note_id: int, user_id: int, db: Session):
    stmt = select(NoteModel).where(NoteModel.id == note_id, NoteModel.owner_id == user_id)
    note = db.execute(stmt).scalars().first()
    if not note:
        return None
    db.delete(note)
    db.commit()
    return True
