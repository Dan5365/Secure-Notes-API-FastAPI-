// src/services/api.js
import axios from 'axios';

const AUTH_API = 'http://51.21.108.193:8000';
const NOTES_API = 'http://51.21.108.193:8001';

// Основной экземпляр для auth сервиса
const api = axios.create({
  baseURL: AUTH_API,
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

  }
  return config;
});

// Создаем экземпляр для notes API
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

// Функция для получения роли из токена
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    // JWT токен состоит из 3 частей: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Некорректный фортокен JWT токена');
      return null;
    }

    // Декодируем payload (вторая часть)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);


    // В зависимости от вашего бэкенда, роль может быть в разных полях
    // Обычно: role, roles, или user_role
    const role = parsedPayload.role || parsedPayload.roles?.[0] || parsedPayload.user_role || 'user';



    return role;
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};

export const authAPI = {
  register: (username, age, password) =>
    api.post('/auth/register', { username, age, password }),

  login: (username, password) =>
    api.post('/auth/login', new URLSearchParams({
      username,
      password
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }),

  verifyToken: () =>
    api.get('/auth/verify-token'),
};

// АДМИНСКИЕ ФУНКЦИИ
export const adminAPI = {
  // Получить всех пользователей
  getAllUsers: () =>
    api.get('/users/users'),

  // Получить пользователя по username
  getUserByUsername: (username) =>
    api.get(`/users/users/by-username/${username}`),

  // Сделать пользователя админом/креатором
  makeAdmin: (userId, role) =>
    api.post(`/users/users/${userId}/make-admin`, { role }),
};

export const notes = {
  getAll: () => notesAPI.get('/notes/'),
  create: (title, content) => notesAPI.post('/notes/', { title, content }),
  update: (id, title, content) => notesAPI.put(`/notes/${id}`, { title, content }),
  delete: (id) => notesAPI.delete(`/notes/${id}`),
};

export default api;
