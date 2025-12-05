import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động gắn token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const authDataString = localStorage.getItem('authData');
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        const token = authData?.token;

        if (token && typeof token === 'string' && token.trim() !== '') {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Lỗi khi parse JSON từ localStorage:', e);
      localStorage.removeItem('authData');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;