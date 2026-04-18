"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "agent" | "admin";
  status: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    refresh();
  }, []);

  return { user, loading, refresh, logout };
}
