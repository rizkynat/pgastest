"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { AuthUser } from "@/types/auth-user";

const AuthUserContext = createContext<AuthUser | null>(null);

export function AuthUserProvider({ user, children }: Readonly<{ user: AuthUser; children: ReactNode }>) {
  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  const user = useContext(AuthUserContext);

  if (!user) {
    throw new Error("useAuthUser must be used within AuthUserProvider");
  }

  return user;
}
