import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bizfiles_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bizfiles_token');
      localStorage.removeItem('bizfiles_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Folders ──────────────────────────────────────────
export const folderAPI = {
  create: (data) => api.post('/folders/create', data),
  getAll: () => api.get('/folders/all'),
  getByParent: (parentFolderId) =>
    api.get('/folders', { params: { parentFolderId: parentFolderId || 'root' } }),
  rename: (id, data) => api.put(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
  getBreadcrumb: (id) => api.get(`/folders/${id}/breadcrumb`),
};

// ── Files ─────────────────────────────────────────────
export const fileAPI = {
  upload: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  getByFolder: (folderId, params) =>
    api.get(`/files/${folderId || 'root'}`, { params }),
  getAll: (params) => api.get('/files', { params }),
  delete: (id) => api.delete(`/files/${id}`),
  rename: (id, data) => api.put(`/files/${id}`, data),
  move: (id, data) => api.put(`/files/${id}/move`, data),
  toggleStar: (id) => api.put(`/files/${id}/star`),
  preview: (id) => api.get(`/files/${id}/preview`, { responseType: 'blob' }),
  getStats: () => api.get('/files/stats'),
};

export default api;
