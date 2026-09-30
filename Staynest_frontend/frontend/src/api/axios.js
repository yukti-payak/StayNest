import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    if (!token) {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        token = user?.token;
      } catch (err) {
        token = null;
      }
    }

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;