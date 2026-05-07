import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Nếu bạn đã có interceptor auth ở chỗ khác thì bỏ đoạn này
http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    const parsed = raw ? JSON.parse(raw) : null;
    const token = parsed?.token || parsed?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export const paymentApi = {
  // BE mình đang làm: POST /api/payments/zalopay/create
  createZaloPayOrder: (payload) => http.post("/api/payments/zalopay/create", payload),
};
