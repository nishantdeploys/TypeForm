"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserLogin, UserCreate, GoogleAuthPayload } from "@/types";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: UserLogin) => Promise<User>;
  register: (data: UserCreate) => Promise<User>;
  googleLogin: (data: GoogleAuthPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("typeform_auth_token");
    const savedUser = localStorage.getItem("typeform_auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("typeform_auth_token");
        localStorage.removeItem("typeform_auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (data: UserLogin): Promise<User> => {
    const res = await authApi.login(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("typeform_auth_token", res.access_token);
    localStorage.setItem("typeform_auth_user", JSON.stringify(res.user));
    return res.user;
  };

  const register = async (data: UserCreate): Promise<User> => {
    const res = await authApi.register(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("typeform_auth_token", res.access_token);
    localStorage.setItem("typeform_auth_user", JSON.stringify(res.user));
    return res.user;
  };

  const googleLogin = async (data: GoogleAuthPayload): Promise<User> => {
    const res = await authApi.google(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("typeform_auth_token", res.access_token);
    localStorage.setItem("typeform_auth_user", JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("typeform_auth_token");
    localStorage.removeItem("typeform_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
