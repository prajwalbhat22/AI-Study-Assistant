// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from localStorage

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN — POST /auth/login
  const login = useCallback(async (email, password) => {
    const response = await axiosClient.post("/auth/login", { email, password });
    const { token: jwt, ...userData } = response.data;

    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return response.data;
  }, []);

  // REGISTER — POST /auth/register
  const register = useCallback(async (name, email, password) => {
    const response = await axiosClient.post("/auth/register",{
  fullName: name,
  email,
  password
    });
    const { token: jwt, ...userData } = response.data;

    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return response.data;
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}