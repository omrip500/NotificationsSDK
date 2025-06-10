import axios from "axios";

const api = axios.create({
  baseURL: "https://api.notificationspanel.com/api",
});

export default api;
