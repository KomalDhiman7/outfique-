import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateProfile: (formData) => API.put('/auth/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ── Posts ─────────────────────────────────────────────────────────────
export const postsAPI = {
  feed: (page = 1) => API.get(`/posts/feed?page=${page}&per_page=12`),
  create: (formData) => API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: (id) => API.get(`/posts/${id}`),
  delete: (id) => API.delete(`/posts/${id}`),
  like: (id) => API.post(`/posts/${id}/like`),
  save: (id) => API.post(`/posts/${id}/save`),
  getComments: (id) => API.get(`/posts/${id}/comments`),
  addComment: (id, content) => API.post(`/posts/${id}/comments`, { content }),
};

// ── Wardrobe ──────────────────────────────────────────────────────────
export const wardrobeAPI = {
  getAll: (category) => API.get(`/wardrobe${category ? `?category=${category}` : ''}`),
  add: (formData) => API.post('/wardrobe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/wardrobe/${id}`),
  stats: () => API.get('/wardrobe/stats'),
};

// ── AI Stylist ────────────────────────────────────────────────────────
export const aiAPI = {
  getMoods: () => API.get('/ai/moods'),
  suggest: (data) => API.post('/ai/suggest', data),
  rateOutfit: (data) => API.post('/ai/rate-outfit', data),
};

// ── Profile ───────────────────────────────────────────────────────────
export const profileAPI = {
  get: (username, tab = 'posts', page = 1) =>
    API.get(`/profile/${username}?tab=${tab}&page=${page}`),
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markAllRead: () => API.post('/notifications/read-all'),
  markRead: (id) => API.post(`/notifications/${id}/read`),
};

// ── Search ────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (q, type = 'all') => API.get(`/search?q=${encodeURIComponent(q)}&type=${type}`),
};

export default API;