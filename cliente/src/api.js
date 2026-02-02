import axios from 'axios';

// --- CONFIGURAÇÃO DE URL ---
// Trocamos o localhost pelo link do Render
// Se você tiver rotas que não são de auth, talvez precise tirar o /auth do final
const baseURL = 'https://sesofa.onrender.com/api/auth'; 

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