// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // Make sure port matches backend
  withCredentials: true, // Enables passing cookies cross-origin if using JWT in HTTP-Only cookies
});

// Attach Authorization header automatically if token exists in localStorage
API.interceptors.request.use(
  (config) => {
    // 1. Try reading standalone token or token saved inside user object
    let token = localStorage.getItem("token");
    
    if (!token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      token = user?.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;