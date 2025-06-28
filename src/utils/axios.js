import axios from 'axios';

const BASE_URL = 'https://ensoilapp.site';
// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      fullError: error
    });
    return Promise.reject(error);
  }
);

export default api; 