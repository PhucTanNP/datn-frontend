import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach access token to outgoing requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers = config.headers || {};
    // ensure headers are plain object
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh handling: single inflight refresh + subscriber queue
let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

const subscribe = (cb: (token: string) => void) => subscribers.push(cb);
const onRefreshed = (token: string) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!error.response) return Promise.reject(error);

    if (error.response.status !== 401) return Promise.reject(error);

    // Don't try to refresh when the refresh endpoint itself failed
    if (originalRequest.url && originalRequest.url.includes('/api/v1/auth/refresh')) {
      // Clear tokens and force login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      // already retried
      return Promise.reject(error);
    }

    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // queue the request
      return new Promise((resolve, reject) => {
        subscribe((token: string) => {
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // call refresh endpoint using plain axios to avoid interceptor loop
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, { refreshToken });
      const payload = resp.data?.data ?? resp.data;
      const newAccessToken = payload?.accessToken as string | undefined;
      const newRefreshToken = payload?.refreshToken as string | undefined;

      if (!newAccessToken) {
        throw new Error('Refresh endpoint did not return accessToken');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      }

      onRefreshed(newAccessToken);
      isRefreshing = false;

      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (e) {
      isRefreshing = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return Promise.reject(e);
    }
  }
);

export default api;