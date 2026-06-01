import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext(null);

async function fetchProfile(email) {
  const rows = await base44.entities.AppUser.filter({ email });
  return rows[0] ?? null;
}

export function AuthProvider({ children }) {
  const [role, setRole]       = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      setRole(null);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchProfile(supabaseUser.email);
      setRole(profile?.role ?? null);
      setUser(profile ?? null);
    } catch {
      setRole(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sessão existente ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session?.user ?? null);
    });

    // Mudanças de sessão (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    role,
    user,
    loading,
    logout,
    isAdmin:      () => role === "admin",
    isGestor:     () => role === "gestor"     || role === "admin",
    isAnalista:   () => role === "analista"   || role === "gestor" || role === "admin",
    isFornecedor: () => role === "fornecedor",
  }), [role, user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
