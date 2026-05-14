import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as auth from "@/components/auth/authSimulator";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(() => auth.getRole());
  const [user, setUserState] = useState(() => auth.getDemoUser());

  const setSession = useCallback((r, u) => {
    auth.setRole(r);
    auth.setDemoUser(u);
    setRoleState(r);
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    auth.clearDemoSession();
    setRoleState("");
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({
      role,
      user: user,
      setSession,
      logout,
      isAdmin: () => role === "admin",
      isGestor: () => role === "gestor" || role === "admin",
      isAnalista: () => role === "analista" || role === "gestor" || role === "admin",
      isFornecedor: () => role === "fornecedor",
    }),
    [role, user, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
