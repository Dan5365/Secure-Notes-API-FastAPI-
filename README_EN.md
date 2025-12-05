# Secure Notes API - Microservices Architecture

A secure, scalable notes management system built with FastAPI using a microservices architecture. This project demonstrates modern software engineering practices including service separation, authentication, authorization, and data validation.

## 🏗️ Architecture Overview

This project follows a **microservices architecture** pattern, consisting of two independent services:

### Services

1. **Auth Service** (`auth-service/`)
   - Port: `8001` (mapped from container port `8000`)
   - Handles user authentication, authorization, and user management
   - Manages JWT token generation and validation
   - Implements role-based access control (RBAC)

2. **Notes Service** (`notes-service/`)
   - Port: `8002` (mapped from container port `8000`)
   - Handles note CRUD operations
   - Depends on Auth Service for token verification
   - Manages user-specific notes with ownership validation

### Inter-Service Communication

The Notes Service communicates with the Auth Service via HTTP requests to verify JWT tokens. This demonstrates a **service-to-service authentication pattern** where:
- Notes Service acts as a client to Auth Service
- Auth Service exposes a `/verify-token` endpoint
- Services communicate through Docker's internal network (`auth-service:8000`)

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration**: Users register with username, password, and age
2. **User Login**: Users authenticate and receive a JWT access token
3. **Token-Based Access**: All protected endpoints require a Bearer token in the Authorization header

### Role-Based Access Control (RBAC)

The system implements three user roles:

- **`user`** (default): Standard users who can manage their own notes
- **`admin`**: Can view all users and user information
- **`creator`**: Highest privilege level, can promote users to admin role

### Security Features

- **Password Hashing**: Uses `bcrypt` via `passlib` for secure password storage
- **JWT Tokens**: JSON Web Tokens (HS256 algorithm) for stateless authentication
- **Token Verification**: Centralized token validation through Auth Service
- **OAuth2 Password Flow**: Implements OAuth2PasswordBearer for token extraction

## ✅ Data Validation

The project uses **Pydantic** for comprehensive data validation at the API layer:

### User Validation

- **Username**: 
  - Minimum length: 3 characters
  - Maximum length: 30 characters
- **Age**: 
  - Range: 0 to 120 (inclusive)
  - Must be a valid integer
- **Password**: 
  - Required field
  - Hashed before storage (never stored in plain text)

### Note Validation

- **Title**: 
  - Minimum length: 1 character
  - Maximum length: 100 characters
  - Required field
- **Content**: 
  - Minimum length: 1 character
  - Required field
- **Timestamps**: 
  - Automatically generated with UTC timezone
  - `created_at`: Set on note creation
  - `updated_at`: Updated on note modification

### Validation Benefits

- **Type Safety**: Automatic type checking and conversion
- **Input Sanitization**: Prevents invalid data from entering the system
- **API Documentation**: FastAPI automatically generates OpenAPI docs from Pydantic models
- **Error Messages**: Clear, descriptive validation error responses

## 📋 Features

### Auth Service Features

#### User Management
- **POST `/users/register`**: Register a new user
  - Validates username uniqueness
  - Hashes password before storage
  - Returns user information (excluding password)
  
- **POST `/users/login`**: Authenticate and receive JWT token
  - Validates credentials
  - Returns access token and token type
  
- **GET `/users/users`**: List all users (Admin/Creator only)
  - Requires admin or creator role
  - Returns list of all registered users
  
- **GET `/users/users/by-username/{username}`**: Get user by username (Admin/Creator only)
  - Requires admin or creator role
  - Returns specific user information

#### Role Management
- **POST `/users/users/{user_id}/make-admin`**: Promote user to admin (Creator only)
  - Requires creator role
  - Updates user role to "admin"

#### Token Verification
- **GET `/auth/verify-token`**: Verify JWT token validity
  - Used by Notes Service for inter-service authentication
  - Returns user information if token is valid

### Notes Service Features

#### Note CRUD Operations
- **GET `/users/notes`**: Get all notes for the authenticated user
  - Requires valid JWT token
  - Returns only notes owned by the user
  
- **GET `/users/notes/{note_id}`**: Get a specific note by ID
  - Requires valid JWT token
  - Validates note ownership
  - Returns 404 if note doesn't exist or doesn't belong to user
  
- **POST `/users/notes`**: Create a new note
  - Requires valid JWT token
  - Automatically associates note with authenticated user
  - Validates title and content
  
- **PUT `/users/notes/{note_id}`**: Update an existing note
  - Requires valid JWT token
  - Validates note ownership
  - Updates `updated_at` timestamp
  - Returns 404 if note doesn't exist or doesn't belong to user
  
- **DELETE `/users/notes/{note_id}`**: Delete a note
  - Requires valid JWT token
  - Validates note ownership
  - Returns 404 if note doesn't exist or doesn't belong to user

### Data Models

#### User Model
```python
- id: int (Primary Key)
- username: str
- password_hash: str (bcrypt hashed)
- age: int
- role: str (default: "user")
```

#### Note Model
```python
- id: int (Primary Key)
- title: str
- content: str
- owner_id: int (Foreign Key to users.id)
- created_at: datetime (UTC)
- updated_at: datetime (UTC)
```

## 🛠️ Technology Stack

### Backend Framework
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications

### Database & ORM
- **SQLAlchemy 2.0**: Modern ORM with type hints
- **SQLite**: Lightweight database (can be easily replaced with PostgreSQL/MySQL)

### Authentication & Security
- **PyJWT**: JWT token encoding/decoding
- **passlib**: Password hashing with bcrypt
- **OAuth2**: OAuth2 password flow implementation

### Data Validation
- **Pydantic 2.x**: Data validation and settings management using Python type annotations

### Containerization
- **Docker**: Containerization for each service
- **Docker Compose**: Orchestration of multiple services

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Python 3.8+ (for local development)

### Running with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Secure-Notes-API-FastAPI-
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the services**
   - Auth Service: http://localhost:8001
   - Notes Service: http://localhost:8002
   - Auth Service API Docs: http://localhost:8001/docs
   - Notes Service API Docs: http://localhost:8002/docs

### Running Locally (Development)

1. **Install dependencies for Auth Service**
   ```bash
   cd auth_service
   pip install -r requirements.txt
   ```

2. **Install dependencies for Notes Service**
   ```bash
   cd notes_service
   pip install -r requirements.txt
   ```

3. **Run Auth Service**
   ```bash
   cd auth_service
   python main.py
   ```

4. **Run Notes Service** (in a separate terminal)
   ```bash
   cd notes_service
   python main.py
   ```

**Note**: When running locally, update `AUTH_SERVICE_URL` in `notes-service/auth_proxy.py` to `http://localhost:8001` instead of `http://auth-service:8000`.

## 📡 API Usage Examples

### 1. Register a New User

```bash
curl -X POST "http://localhost:8001/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123",
    "age": 25
  }'
```

### 2. Login and Get Token

```bash
curl -X POST "http://localhost:8001/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### 3. Create a Note

```bash
curl -X POST "http://localhost:8002/users/notes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note."
  }'
```

### 4. Get All Notes

```bash
curl -X GET "http://localhost:8002/users/notes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Update a Note

```bash
curl -X PUT "http://localhost:8002/users/notes/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Note Title",
    "content": "Updated content here."
  }'
```

### 6. Delete a Note

```bash
curl -X DELETE "http://localhost:8002/users/notes/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Considerations

### Current Implementation
- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control
- Input validation on all endpoints
- Ownership validation for notes

### Production Recommendations
- Use environment variables for `SECRET_KEY` (currently hardcoded)
- Implement token expiration and refresh tokens
- Use HTTPS in production
- Add rate limiting to prevent abuse
- Implement database connection pooling
- Use a production-grade database (PostgreSQL, MySQL)
- Add comprehensive logging and monitoring
- Implement CORS policies
- Add request validation middleware
- Consider implementing API versioning

## 📁 Project Structure

```
Secure-Notes-API-FastAPI-/
├── auth-service/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── auth.py              # JWT token creation and validation
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── routers/
│   │   └── users.py         # User management endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Container configuration
│   └── users.db             # SQLite database
│
├── notes-service/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── auth.py              # Local auth utilities
│   ├── auth_proxy.py        # Inter-service auth communication
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── routers/
│   │   └── notes.py         # Notes CRUD endpoints
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Container configuration
│
├── docker-compose.yml       # Service orchestration
└── README.md                # This file
```

## 🧪 Testing

The project includes HTTP test files for manual testing:
- `auth-service/test_main.http`
- `notes-service/test_main.http`

You can use these with REST client extensions in your IDE (e.g., REST Client for VS Code).

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using FastAPI and Microservices Architecture**

