import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ROLES } from "@/components/auth/authSimulator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, FileCheck, Scale, MessageSquare, Users, Loader2, Eye, EyeOff } from "lucide-react";

const features = [
  { icon: FileCheck,    text: "Validação automática Two-Way Matching" },
  { icon: Scale,        text: "Workflow de aprovação por alçadas" },
  { icon: MessageSquare,text: "Central de disputas em tempo real" },
  { icon: Users,        text: "Gestão de usuários e permissões" },
];

const DEMO_HINTS = [
  { email: "ana@empresa.com",             role: "admin" },
  { email: "carlos@empresa.com",          role: "gestor" },
  { email: "mariana@empresa.com",         role: "analista" },
  { email: "contato@empresaalfa.com.br",  role: "fornecedor" },
];

export default function Acesso() {
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
    }
    // Sucesso: onAuthStateChange no AuthContext cuida do redirect via HomeRedirect
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("GovFiscal@2025");
    setError("");
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">GovFiscal</span>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight">Governança e Validação Fiscal</h1>
            <p className="mt-3 text-primary-foreground/75 text-lg leading-relaxed">
              Plataforma Procure-to-Pay para controle completo do ciclo de notas fiscais, contratos e aprovações.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-foreground/40 text-xs">© 2025 GovFiscal · Projeto Acadêmico</p>
      </div>

      {/* Painel direito — login */}
      <div className="flex-1 flex flex-col justify-center bg-background px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GovFiscal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
            <p className="text-muted-foreground mt-1 text-sm">Use suas credenciais corporativas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          {/* Acesso rápido demo */}
          <div className="mt-8 border-t pt-6">
            <p className="text-xs text-muted-foreground mb-3 text-center">Acesso rápido (demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_HINTS.map(({ email: demoEmail, role }) => {
                const meta = ROLES[role];
                return (
                  <button
                    key={role}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${meta.color}`}
                    onClick={() => fillDemo(demoEmail)}
                  >
                    <span className="font-medium block">{meta.label}</span>
                    <span className="opacity-70 truncate block">{demoEmail}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Senha: GovFiscal@2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
