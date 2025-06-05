import axios from "axios";

const api = axios.create({
  baseURL: "http://54.147.164.209:8000/api",
});

export default api;
