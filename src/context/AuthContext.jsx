import React, { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/api/auth.api";

const AuthContext = createContext(null);

const AUTH_KEY = "auth";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!auth?.accessToken;

  // ✅ LOGIN → lưu 1 key
  const login = ({ accessToken, refreshToken, user }) => {
    const authData = { accessToken, refreshToken, user };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    setAuth(authData);
  };

  // ✅ LOGOUT → xoá 1 key
  const logout = async () => {
    try {
      if (auth?.refreshToken) {
        await authApi.logout({ refreshToken: auth.refreshToken });
      }
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem(AUTH_KEY);
      setAuth(null);
    }
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      accessToken: auth?.accessToken || null,
      refreshToken: auth?.refreshToken || null,
      user: auth?.user || null,
      login,
      logout,
    }),
    [auth, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
};
