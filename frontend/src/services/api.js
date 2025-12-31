import axios from 'axios';

const AUTH_API = 'http://localhost:8000';
const NOTES_API = 'http://localhost:8001';

const api = axios.create({
  baseURL: AUTH_API,
});

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, age , password) =>
    api.post('/users/register', { username, age, password }),
  login: (username, password) =>
  api.post('/users/login', new URLSearchParams({
    username,
    password
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
};

export const notesAPI = axios.create({
  baseURL: NOTES_API,
});

notesAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notes = {
  getAll: () => notesAPI.get('/notes/'),
  create: (title, content) => notesAPI.post('/notes/', { title, content }),
  update: (id, title, content) => notesAPI.put(`/notes/${id}`, { title, content }),
  delete: (id) => notesAPI.delete(`/notes/${id}`),
};