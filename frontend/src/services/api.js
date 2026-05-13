import axios from 'axios';

// สร้าง axios instance ที่มี baseURL ไปยัง Backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Interceptor: แนบ token ทุก request อัตโนมัติ
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth API 
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Boards API 
export const boardAPI = {
  getAll: () => api.get('/boards'),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  addMember: (id, username) => api.post(`/boards/${id}/members`, { username }),
};

// Tasks API 
export const taskAPI = {
  getAll: (boardId) => api.get('/tasks', { params: { boardId } }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Invite API
export const invitationAPI = {
  send: (boardId, toUsername) => api.post('/invitations', { boardId, toUsername }),
  getMine: () => api.get('/invitations'),
  accept: (id) => api.put(`/invitations/${id}/accept`),
  reject: (id) => api.put(`/invitations/${id}/reject`),
};

export default api;