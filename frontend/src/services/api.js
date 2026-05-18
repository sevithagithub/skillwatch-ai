import axios from 'axios';

const API = axios.create({ baseURL: '/api', timeout: 45000 }); // 45s — covers Render free-tier cold start

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const updateProfile = (data) => API.put('/auth/profile', data);
export const getMe = () => API.get('/auth/me');
export const getSkills = () => API.get('/skills/');
export const getSkillDetail = (name) => API.get(`/skills/${name}`);
export const getForecast = (skill) => API.get(`/forecast/${skill}`);
export const getResources = (skill) => API.get(`/resources/${skill}`);
export const getRecommendations = (data) => API.post('/recommend/', data);
export const getRegions = () => API.get('/regions/');
export const getGraph = () => API.get('/graph/');
export const getRelatedSkills = (skill) => API.get(`/graph/related/${skill}`);
export const getMatches = () => API.get('/matches/');

// Admin endpoints (require admin key)
export const getAdminUsers = (key) => API.get('/admin/users', { headers: { 'X-Admin-Key': key } });
export const getAdminStats = (key) => API.get('/admin/stats', { headers: { 'X-Admin-Key': key } });
export const deleteAdminUser = (id, key) => API.delete(`/admin/users/${id}`, { headers: { 'X-Admin-Key': key } });

export default API;
