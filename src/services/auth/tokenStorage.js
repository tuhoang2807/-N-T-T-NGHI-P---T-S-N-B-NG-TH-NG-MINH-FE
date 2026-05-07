const AUTH_KEY = "auth";

const readAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeAuth = (auth) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

export const tokenStorage = {
  getAccessToken() {
    return readAuth()?.accessToken || null;
  },

  setAccessToken(token) {
    if (!token) return;
    const auth = readAuth() || {};
    writeAuth({ ...auth, accessToken: token });
  },

  getRefreshToken() {
    return readAuth()?.refreshToken || null;
  },

  setRefreshToken(token) {
    if (!token) return;
    const auth = readAuth() || {};
    writeAuth({ ...auth, refreshToken: token });
  },

  setUser(user) {
    if (!user) return;
    const auth = readAuth() || {};
    writeAuth({ ...auth, user });
  },

  clear() {
    localStorage.removeItem(AUTH_KEY);
  },
};
