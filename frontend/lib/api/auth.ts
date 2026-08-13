import { fetchApi } from "./client";
import { User, UserCreate, UserLogin, GoogleAuthPayload, TokenResponse } from "@/types";

export const authApi = {
  register: (data: UserCreate) =>
    fetchApi<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: UserLogin) =>
    fetchApi<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  google: (data: GoogleAuthPayload) =>
    fetchApi<TokenResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: (token: string) =>
    fetchApi<User>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
