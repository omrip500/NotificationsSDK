import axios from "axios";

// const api = axios.create({
//   baseURL: "https://api.notificationspanel.com/api",
// });

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://api.notificationspanel.com/api"
      : "http://localhost:8000/api",
});

export default api;
