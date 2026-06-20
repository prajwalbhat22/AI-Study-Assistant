// src/api/axiosClient.js

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // ← Change to your Spring Boot base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;