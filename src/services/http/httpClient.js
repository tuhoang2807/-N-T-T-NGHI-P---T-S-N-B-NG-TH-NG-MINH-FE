import axios from "axios";
import { ENV } from "../../config/env";
import { tokenStorage } from "../auth/tokenStorage";

// ==============================
// Axios instance
// ==============================
export const httpClient = axios.create({
  baseURL: ENV.API_BASE_URL, // vd: http://localhost:8080
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Helpers: force logout
// ==============================
const forceLogout = () => {
  try {
    tokenStorage.clear();
  } finally {
    // xử lý thủ công: đá thẳng về login
    // (nếu bạn muốn giữ lại returnUrl thì có thể append query)
    window.location.href = "/login";
  }
};

// ==============================
// 1) Request interceptor
// ==============================
httpClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// 2) Refresh queue
// ==============================
let isRefreshing = false;
let pendingQueue = [];

const runQueue = (newToken) => {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
};

// ==============================
// 3) Response interceptor
// ==============================
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ==========================
    // Normalize error message (phục vụ reject cuối)
    // ==========================
    const normalizedMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";

    // tránh loop vô hạn
    if (originalRequest._retry) {
      // nếu đã retry rồi mà vẫn 401 -> logout luôn cho chắc
      if (status === 401) forceLogout();

      return Promise.reject({
        status,
        message: normalizedMessage,
        raw: error,
      });
    }

    // ==========================
    // 401 → refresh token
    // ==========================
    if (status === 401) {
      originalRequest._retry = true;

      // Nếu request hiện tại chính là refresh endpoint mà vẫn 401 => refresh token chết
      const reqUrl = originalRequest?.url || "";
      if (reqUrl.includes("/api/v1/auth/refresh")) {
        runQueue(null);
        forceLogout();
        return Promise.reject({
          status,
          message: normalizedMessage,
          raw: error,
        });
      }

      // nếu đang refresh → chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (!newToken) {
              // refresh fail -> logout
              forceLogout();
              return reject({
                status: 401,
                message: "Session expired. Please login again.",
                raw: error,
              });
            }

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(httpClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          runQueue(null);
          forceLogout();
          return Promise.reject({
            status: 401,
            message: "Missing refresh token. Please login again.",
            raw: error,
          });
        }

        // ⚠️ gọi axios "trần" để tránh interceptor
        const refreshRes = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        // BE có thể trả:
        // { status, message, data: { accessToken } }
        // hoặc { accessToken }
        const newAccessToken =
          refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;

        if (!newAccessToken) {
          runQueue(null);
          forceLogout();
          return Promise.reject({
            status: 401,
            message: "Refresh failed. Please login again.",
            raw: error,
          });
        }

        // ✅ update accessToken
        tokenStorage.setAccessToken(newAccessToken);

        // resolve các request đang chờ
        runQueue(newAccessToken);

        // retry request cũ
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (e) {
        runQueue(null);
        forceLogout();

        return Promise.reject({
          status: 401,
          message:
            e?.response?.data?.message ||
            e?.message ||
            "Refresh token expired. Please login again.",
          raw: e,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // ==========================
    // Reject normalized error (non-401)
    // ==========================
    return Promise.reject({
      status,
      message: normalizedMessage,
      raw: error,
    });
  }
);
