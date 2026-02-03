import axios from 'axios';
import apiRoutes from "./routes"
import { Route, Routes } from 'react-router-dom';
import routes from '../routes'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

// 🔁 RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ❌ Si pas 401 → on laisse passer
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // ❌ Empêcher boucle infinie
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // 🔄 Si refresh déjà en cours → on attend
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => axiosInstance(originalRequest));
        }

        isRefreshing = true;

        try {
            // 🔑 Appel refresh token
            await axios.post(
                apiRoutes.refresh, //'/auth/refresh',
                {},
                {
                    baseURL: axiosInstance.defaults.baseURL,
                    withCredentials: true,
                }
            );

            processQueue();
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError);

           localStorage.clear();

            // 🚪 Logout propre
            window.location.href = '/';

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
