# Intelligent Notes Platform - Full-Stack Notes Management System with AI

[![RU](https://img.shields.io/badge/lang-RU-red)](README.md)

A modern, intelligent notes management platform with artificial intelligence integration. Built on microservices architecture using FastAPI, React, and Google Gemini AI, demonstrating cutting-edge practices for developing full-stack web applications.

## 🏗️ System Architecture

The project implements a **three-tier microservices architecture** with a modern frontend:

### Backend Services

1. **Auth Service** (Port: `8000`)
   - User authentication and authorization
   - JWT token management and role system
   - User registration and management
   - Role-based access control (RBAC): user, admin, creator

2. **Notes Service** (Port: `8001`)
   - CRUD operations for notes
   - Note ownership validation
   - Integration with Auth Service for authentication
   - Creation and update timestamps

3. **AI Service** (Port: `8002`)
   - Google Gemini AI integration
   - Note improvement based on user instructions
   - Analysis of all user notes
   - Generation of ideas for new notes
   - Local fallback algorithms when AI is unavailable

### Frontend Application

4. **React Frontend** (Port: `5173`)
   - Modern SPA built with React 19 and React Router
   - Responsive interface with Tailwind CSS
   - Interactive AI assistant for notes
   - JWT token authentication
   - Real-time note updates

### Inter-Service Communication

- **Notes ↔ Auth**: HTTP requests for token verification
- **Frontend ↔ All Services**: REST API via Axios
- **AI Service ↔ Gemini**: External API for AI processing
- **Docker Network**: Internal network for service communication

## 🤖 Artificial Intelligence

### Google Gemini AI Integration

The system includes a full-featured AI service providing:

#### Note Enhancement
- **Style Improvement**: Text formatting and structuring
- **Summarization**: Automatic compression of long notes
- **Paraphrasing**: Rewriting text while preserving meaning
- **Error Correction**: Grammar and spelling checks
- **Professionalization**: Converting to business style
- **Simplification**: Adapting complex text for better understanding

#### Note Analysis
- Identifying main themes in note collections
- Providing personalized recommendations
- Suggestions for organization and structuring

#### Idea Generation
- Creating new ideas based on existing notes
- Suggestions for topic development
- Creative prompts for continued work

#### Technical Features
- **Fallback System**: Local algorithms when AI is unavailable
- **Security**: Content filtering and protection against malicious input
- **Performance**: Optimized Gemini API requests
- **User Experience**: Intuitive interface with preset commands

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**: Users create accounts with username, password, and age
2. **Login**: Authentication via login form with JWT token receipt
3. **Protected Access**: All operations require valid Bearer token
4. **Automatic Logout**: On token expiration or authentication errors

### Role-Based System (RBAC)

- **`user`** (default): Manage own notes
- **`admin`**: View all users and their information
- **`creator`**: Full privileges, including assigning administrators

### Security Features

- **Password Hashing**: bcrypt via passlib
- **JWT Tokens**: Stateless authentication with HS256
- **Inter-Service Verification**: Centralized validation via Auth Service
- **OAuth2 Flow**: Standardized authentication process
- **Ownership Validation**: Users see only their own notes

## 💻 Frontend Capabilities

### Modern React Interface

#### Core Features
- **Responsive Design**: Works on all devices
- **Real-Time**: Instant note updates
- **Intuitive UX**: Simple creation, editing, and deletion
- **Visual Feedback**: Animations and status notifications

#### AI Assistant
- **Modal Interface**: Full-featured AI interaction interface
- **Three Modes**: Enhancement, analysis, idea generation
- **Preset Commands**: Quick access to popular functions
- **Version Comparison**: Visual comparison of original and improved versions
- **Apply Changes**: One-click note updates

#### Technical Features
- **React 19**: Latest version with improved performance
- **React Router**: SPA navigation with protected routes
- **Axios**: HTTP client with automatic authorization headers
- **Tailwind CSS**: Utility-first CSS for rapid styling
- **Vite**: Modern bundler for fast development

## 📋 API Endpoints

### Auth Service (`/users`, `/auth`)

#### User Management
- `POST /users/register` - Register new user
- `POST /users/login` - Login and receive JWT token
- `GET /users/users` - List all users (Admin+)
- `GET /users/users/by-username/{username}` - Search by username (Admin+)
- `POST /users/users/{user_id}/make-admin` - Assign administrator (Creator)

#### Authentication
- `GET /auth/verify-token` - Verify token validity (for services)

### Notes Service (`/notes`)

#### CRUD Operations
- `GET /notes/` - Get all user notes
- `GET /notes/{note_id}` - Get specific note
- `POST /notes/` - Create new note
- `PUT /notes/{note_id}` - Update note
- `DELETE /notes/{note_id}` - Delete note

### AI Service (`/ai`)

#### AI Functions
- `POST /ai/improve-note` - Improve note based on instruction
- `POST /ai/analyze-notes` - Analyze all user notes
- `POST /ai/generate-idea` - Generate new ideas
- `GET /ai/health` - Check AI service health

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy 2.0**: ORM with type support
- **SQLite**: Lightweight database
- **Pydantic**: Data validation and serialization
- **PyJWT**: JWT token handling
- **passlib**: Secure password hashing
- **Google Generative AI**: Gemini integration

### Frontend
- **React 19**: Modern UI library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast bundler and dev server

### DevOps & Deployment
- **Docker**: Service containerization
- **Docker Compose**: Multi-service application orchestration
- **Uvicorn**: ASGI server for FastAPI

## 🚀 Quick Start

### Requirements
- Docker and Docker Compose
- Python 3.8+ (for local development)
- Node.js 18+ (for frontend)

### Run with Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd Secure-Notes-API-FastAPI-

# Start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:5173
# Auth API: http://localhost:8000/docs
# Notes API: http://localhost:8001/docs
# AI API: http://localhost:8002/docs
```

### Local Development

#### Backend Services

```bash
# Auth Service
cd auth_service
pip install -r requirements.txt
python main.py  # Port 8000

# Notes Service
cd notes_service
pip install -r requirements.txt
python main.py  # Port 8001

# AI Service
cd ai_service
pip install -r requirements.txt
python main.py  # Port 8002
```

#### Frontend

```bash
cd frontend
npm install
npm run dev  # Port 5173
```

## 📱 Using the Application

### 1. Registration and Login
1. Open http://localhost:5173
2. Register or log into the system
3. Access the notes management dashboard

### 2. Managing Notes
- **Creation**: Click "Create New Note"
- **Editing**: Click "Edit" on any note
- **Deletion**: Use the "Delete" button
- **AI Help**: Click "AI" to improve a note

### 3. Working with AI Assistant
1. Select a note and click the "AI" button
2. Choose mode: Enhancement, Analysis, or Ideas
3. For enhancement, enter instruction or select a preset
4. Review results and apply changes

## 🔧 Configuration

### Environment Variables

```bash
# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Auth Service (for production)
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256

# Notes Service
AUTH_SERVICE_URL=http://auth-service:8000
```

### AI Setup

1. Get API key from Google AI Studio
2. Replace `GEMINI_API_KEY` in `ai_service/ai_service.py`
3. Change model in `MODEL_NAME` if needed

## 📁 Project Structure

```
Intelligent-Notes-Platform/
├── auth_service/           # Authentication service
│   ├── main.py            # FastAPI entry point
│   ├── auth.py            # JWT logic
│   ├── crud.py            # Database operations
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   └── routers/           # API routes
├── notes_service/         # Notes service
│   ├── main.py            # FastAPI entry point
│   ├── auth_client.py     # Auth Service client
│   ├── crud.py            # Database operations
│   ├── models.py          # SQLAlchemy models
│   └── routers/           # API routes
├── ai_service/            # AI service
│   ├── main.py            # FastAPI entry point
│   └── ai_service.py      # Gemini AI integration
├── frontend/              # React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   └── App.jsx        # Main component
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
└── docker-compose.yml     # Service orchestration
```

## 🧪 Testing

### HTTP Tests
- `auth_service/test_main.http` - Auth API tests
- `notes_service/test_main.http` - Notes API tests

### Manual Testing
1. Use Swagger UI for each service
2. Test through frontend interface
3. Check AI functions with various instructions

## 🔒 Security

### Current Measures
- Password hashing with bcrypt
- JWT tokens for stateless authentication
- Input validation via Pydantic
- CORS settings for secure requests
- Resource ownership validation

### Production Recommendations
- Use environment variables for secrets
- Configure HTTPS
- Add rate limiting
- Implement logging and monitoring
- Use production database (PostgreSQL)
- Set up backup and recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a Pull Request

## 📄 License

Project provided for educational and demonstration purposes.

## 📧 Contact

For questions and suggestions, create an issue in the repository.

---

**Built with ❤️ using FastAPI, React, and Google Gemini AI**