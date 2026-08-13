"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, googleLogin } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "347105561737-ese9e1o5moursdqc2s5nm336asul2j98.apps.googleusercontent.com";

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/forms");
    }
  }, [user, router]);

  // Execute Google Authentication with FastAPI Backend
  const executeGoogleAuth = async (emailInput: string, nameInput?: string, avatarUrl?: string) => {
    if (!emailInput.trim()) return;
    setError(null);
    setGoogleLoading(true);

    try {
      await googleLogin({
        email: emailInput.trim(),
        full_name: nameInput?.trim() || emailInput.split("@")[0],
        avatar_url:
          avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailInput)}`,
      });

      router.push("/forms");
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Trigger Official Google Native OAuth 2.0 Popup Window
  const handleGoogleClick = () => {
    setError(null);

    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGoogleLoading(true);
              try {
                // Fetch profile directly from Google API endpoint
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();
                if (googleProfile && googleProfile.email) {
                  await executeGoogleAuth(
                    googleProfile.email,
                    googleProfile.name || googleProfile.given_name,
                    googleProfile.picture
                  );
                } else {
                  setError("Could not retrieve profile from Google account.");
                }
              } catch (fetchErr: any) {
                setError("Failed to verify Google account profile.");
              } finally {
                setGoogleLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            console.warn("Google OAuth Popup closed:", err);
          },
        });

        // Open official Google native login popup window directly
        tokenClient.requestAccessToken({ prompt: "select_account" });
      } catch (err: any) {
        setError(err.message || "Unable to launch Google OAuth popup.");
      }
    } else {
      setError("Google OAuth script loading... Please wait a second and try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }
        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        });
      }
      router.push("/forms");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      {/* Official Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      {/* Lighting Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "Admin Login" : "Create Account"}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-medium">
            {mode === "login"
              ? "Sign in to manage your forms and view responses"
              : "Register a new creator account"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "login"
                ? "bg-zinc-800 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "register"
                ? "bg-zinc-800 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading || loading}
          className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold text-zinc-200 transition-all active:scale-[0.98]"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* OR Separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
            OR WITH EMAIL & PASSWORD
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl p-3.5 text-sm font-medium text-white outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl p-3.5 text-sm font-medium text-white outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl p-3.5 pr-10 text-sm font-medium text-white outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Register Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
