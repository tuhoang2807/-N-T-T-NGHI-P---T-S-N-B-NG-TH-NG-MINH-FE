import { httpClient } from "../http/httpClient";
import { tokenStorage } from "../auth/tokenStorage";

// ResponseFormat chuẩn của BE:
// { code, message, data }

export const authApi = {
  async login(payload) {
    const res = await httpClient.post("/api/v1/auth/login", payload);
    return res.data;
  },

  async register(payload) {
    const res = await httpClient.post("/api/v1/auth/register", payload);
    return res.data;
  },

  async forgotPassword(payload) {
    const res = await httpClient.post("/api/v1/auth/forgot-password", payload);
    return res.data;
  },

  async resetPassword(payload) {
    const res = await httpClient.post("/api/v1/auth/reset-password", payload);
    return res.data;
  },

  async refresh() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const res = await httpClient.post("/api/v1/auth/refresh", { refreshToken });

    const newAccessToken = res.data?.accessToken;
    if (!newAccessToken) {
      throw new Error("Không nhận được access token mới");
    }

    tokenStorage.setAccessToken(newAccessToken);
    return newAccessToken;
  },

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await httpClient.post("/api/v1/auth/logout", { refreshToken });
      }
    } finally {
      tokenStorage.clear();
    }
  },
};