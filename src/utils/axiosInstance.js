import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authDataString = localStorage.getItem('authData');

    if (authDataString) {
      try {
        const authData = JSON.parse(authDataString);
        const token = authData?.token;

        if (token && typeof token === 'string' && token.trim() !== '') {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Lỗi khi parse JSON từ localStorage. Đã xóa dữ liệu lỗi.', e);
        localStorage.removeItem('authData');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

