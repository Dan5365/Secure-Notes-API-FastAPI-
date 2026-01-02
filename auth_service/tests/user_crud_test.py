from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from auth_service.crud import get_users, get_user_by_username, create_user
from auth_service.database import Base, engine
import pytest

from auth_service.models import UserModel
from auth_service.schemas import UserCreate

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


class TestGetUsers:
    def test_no_users(self, db_session):
        users = get_users(db_session)
        assert len(users) == 0

    def test_one_user(self, db_session):
        new_user = UserModel(
            username="testuser",
            age=20,
            role="user",
            password_hash="1234abc"
        )
        db_session.add(new_user)
        db_session.commit()

        users = get_users(db_session)

        assert len(users) == 1
        assert users[0].username == "testuser"
        assert users[0].age == 20
        assert users[0].role == "user"
        assert users[0].password_hash == "1234abc"

    def test_many_users(self, db_session):
        new_user1 = UserModel(
            username="testuser1",
            age=20,
            role="user",
            password_hash="1234abc"
        )
        new_user2 = UserModel(
            username="testuser2",
            age=10,
            role="admin",
            password_hash="5678abc"
        )
        db_session.add(new_user1)
        db_session.add(new_user2)
        db_session.commit()
        users = get_users(db_session)
        assert len(users) == 2

        assert users[0].username == "testuser1"
        assert users[0].age == 20
        assert users[0].role == "user"
        assert users[0].password_hash == "1234abc"

        assert users[1].username == "testuser2"
        assert users[1].age == 10
        assert users[1].role == "admin"
        assert users[1].password_hash == "5678abc"


class TestGetUserByUsername:
    def test_no_user_found(self, db_session):
        user = get_user_by_username("some_user", db_session)
        assert user is None

    def test_user_found(self, db_session):
        new_user = UserModel(
            username="some_user",
            age=20,
            role="user",
            password_hash="1234abc"
        )
        db_session.add(new_user)
        db_session.commit()
        user = get_user_by_username("some_user", db_session)

        assert user is not None
        assert user.username == "some_user"
        assert user.age == 20
        assert user.role == "user"
        assert user.password_hash == "1234abc"

    def test_user_found_among_many(self, db_session):
        new_user1 = UserModel(
            username="some_user",
            age=20,
            role="user",
            password_hash="1234abc"
        )
        new_user2 = UserModel(
            username="some_user2",
            age=15,
            role="admin",
            password_hash="4321cba"
        )

        db_session.add(new_user1)
        db_session.add(new_user2)
        db_session.commit()

        user1 = get_user_by_username("some_user", db_session)
        user2 = get_user_by_username("some_user2", db_session)

        assert user1 is not None
        assert user1.username == "some_user"
        assert user1.age == 20
        assert user1.role == "user"
        assert user1.password_hash == "1234abc"

        assert user2 is not None
        assert user2.username == "some_user2"
        assert user2.age == 15
        assert user2.role == "admin"
        assert user2.password_hash == "4321cba"


class TestCreateUser:
    def test_create_user_success(self, db_session):
        user_data = UserCreate(username="some_user", age=20, password="1234abc")
        created_user = create_user(db_session, user_data)

        assert created_user.username == "some_user"
        assert created_user.age == 20
        assert created_user.password_hash != "1234abc"
        assert created_user.role == "user"
        assert created_user.id > 0

    def create_user_with_custom_role(self, db_session):
        user_data = UserCreate(username="admin_user", age=21, password="4321")
        created_user = create_user(db_session, user_data, role="admin")
        assert created_user.username == "admin_user"
        assert created_user.age == 21
        assert created_user.role == "admin"
        assert created_user.id > 0
