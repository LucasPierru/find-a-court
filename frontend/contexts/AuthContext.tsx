"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthResponse, User } from "shared";
import { AuthModal } from "@/components/AuthModal";
import { logoutSession, refreshSession } from "@/lib/auth-api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  login: (session: AuthResponse) => void;
  logout: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session.user);
        setAccessToken(session.accessToken);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function login(session: AuthResponse): void {
    setUser(session.user);
    setAccessToken(session.accessToken);
    setStatus("authenticated");
    setIsAuthModalOpen(false);
  }

  async function logout(): Promise<void> {
    await logoutSession().catch(() => {});
    setUser(null);
    setAccessToken(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        accessToken,
        login,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
      <AuthModal open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
