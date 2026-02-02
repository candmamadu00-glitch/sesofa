import axios from 'axios';

// --- CONFIGURAÇÃO AUTOMÁTICA DE URL ---
// Se existir um link configurado no .env (Produção), usa ele.
// Se não, usa o localhost (Desenvolvimento).
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: baseURL
});

// Interceptor: Adiciona o Token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;