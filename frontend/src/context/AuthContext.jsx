import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }

    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) { clearTokens(); setLoading(false); return; }

        API.post("/auth/refresh", { refresh_token: refresh })
          .then((res) => { localStorage.setItem("access_token", res.data.access_token); return API.get("/auth/me"); })
          .then((res) => setUser(res.data))
          .catch(() => clearTokens())
          .finally(() => setLoading(false));
      })
      .finally(() => setLoading(false));
  }, []);

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const register = useCallback(async (email, username, password) => {
    const res = await API.post("/auth/register", { email, username, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => clearTokens(), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}