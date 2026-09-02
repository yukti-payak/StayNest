import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true // Enables sending and receiving cookies across ports
});

export default API;