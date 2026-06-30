import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const message =
      err.response?.data?.error ||
      (err.code === "ECONNABORTED" ? "Tempo de conexão esgotado." : "Erro ao conectar com o servidor.");
    return Promise.reject(new Error(message));
  }
);

export default api;
