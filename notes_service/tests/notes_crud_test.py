from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from notes_service.database import Base, engine
from notes_service.crud import get_notes
import pytest

from notes_service.models import NoteModel

TestDB_URL = "sqlite:///test.db"
engine = create_engine(TestDB_URL)
SessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="function", autouse=True)
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


class TestGetNotes:
    def test_no_notes(self, db_session):
        notes = get_notes(1,db_session)
        assert len(notes) == 0

    def test_one_note(self, db_session):
        note = NoteModel(
            title = "some_title",
            content = "some_content",
            
        )
        notes = get_notes()

# def get_notes(user_id: int, db: Session):
#     stmt = select(NoteModel).where(NoteModel.owner_id == user_id)
#     notes = db.execute(stmt).scalars().all()
#     return notes

# class NoteModel(Base):
#     __tablename__ = "notes"
#
#     id: Mapped[int] = mapped_column(primary_key=True)
#     title: Mapped[str]
#     content: Mapped[str]
#     owner_id: Mapped[int]
#     created_at: Mapped[datetime.datetime] = mapped_column(
#         default=lambda: datetime.datetime.now(datetime.timezone.utc)
#     )
#     updated_at: Mapped[datetime.datetime] = mapped_column(
#         default=lambda: datetime.datetime.now(datetime.timezone.utc)
#     )