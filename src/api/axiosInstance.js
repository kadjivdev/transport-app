import axios from 'axios';
import apiRoutes from "./routes"
// import { Route, Routes } from 'react-router-dom';
// import routes from '../routes'

console.log(`The baseUrl : ${import.meta.env.VITE_API_URL}`)
const axiosInstance = axios.create({
    // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, tokenRefreshed = false) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            resolve(axiosInstance(config));
        }
    });

    failedQueue = [];
};

console.log(`The axios default baseUrl : ${axiosInstance.defaults.baseURL}`)

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve,
                    reject,
                    config: originalRequest,
                });
            });
        }

        isRefreshing = true;

        try {
            await axiosInstance.post(
                apiRoutes.refresh,
                {},
                {
                    baseURL: axiosInstance.defaults.baseURL,
                    withCredentials: true,
                }
            );

            processQueue(null);
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError);

            localStorage.clear();
            window.location.href = '/';

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
