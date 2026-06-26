import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : 'http://localhost:5000/api';
export const API = axios.create({
  baseURL: apiBaseUrl,
});

// Request Interceptor: inject token into Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flashmind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle token expiration or session invalidation
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session data
      localStorage.removeItem('flashmind_token');
      localStorage.removeItem('flashmind_user');

      const currentRoute = window.location.hash.replace(/^#/, '') || '/';
      const isAuthRoute = currentRoute.includes('/login') || currentRoute.includes('/register') || currentRoute === '/';

      // If we are not already on login or landing, redirect
      if (!isAuthRoute) {
        window.location.hash = '#/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Helper methods
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
};

export const subjectService = {
  getAll: () => API.get('/subjects'),
  create: (subjectData) => API.post('/subjects', subjectData),
  update: (id, subjectData) => API.put(`/subjects/${id}`, subjectData),
  delete: (id) => API.delete(`/subjects/${id}`),
};

export const flashcardService = {
  getAll: (subjectId) => API.get('/flashcards', { params: { subjectId } }),
  create: (cardData) => API.post('/flashcards', cardData),
  update: (id, cardData) => API.put(`/flashcards/${id}`, cardData),
  delete: (id) => API.delete(`/flashcards/${id}`),
  review: (id, rating) => API.post(`/flashcards/${id}/review`, { rating }),
};

export const aiService = {
  generate: (payload) => API.post('/ai/generate', payload),
  generateQuiz: (payload) => API.post('/ai/generate-quiz', payload),
};

export const quizService = {
  saveScore: (payload) => API.post('/quizzes', payload),
  getHistory: () => API.get('/quizzes/history'),
};

export const adminService = {
  getStats: () => API.get('/admin/stats'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export const dashboardService = {
  getDashboard: () => API.get('/dashboard'),
};


