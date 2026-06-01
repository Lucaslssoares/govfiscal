import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext.jsx";
import { ROLES } from "@/components/auth/authSimulator";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ChevronRight, FileCheck, Users, Scale, MessageSquare } from "lucide-react";

const demos = [
  {
    role: "admin",
    title: "Administrador",
    desc: "Acesso total, inclusive gestão de usuários.",
    user: { nome: "Ana Souza", email: "ana@empresa.com" },
    dest: "/dashboard",
  },
  {
    role: "gestor",
    title: "Gestor Financeiro",
    desc: "Dashboard, cadastros, alçadas, fechamento e disputas.",
    user: { nome: "Carlos Mendes", email: "carlos@empresa.com" },
    dest: "/dashboard",
  },
  {
    role: "analista",
    title: "Analista Financeiro",
    desc: "Acompanhamento e central de disputas.",
    user: { nome: "Mariana Costa", email: "mariana@empresa.com" },
    dest: "/disputas",
  },
  {
    role: "fornecedor",
    title: "Fornecedor",
    desc: "Portal isolado por CNPJ para envio de notas.",
    user: { nome: "Empresa Alfa Ltda", razao_social: "Empresa Alfa Ltda", email: "contato@empresaalfa.com.br", cnpj: "12345678000190" },
    dest: "/fornecedor",
  },
];

const features = [
  { icon: FileCheck, text: "Validação automática Two-Way Matching" },
  { icon: Scale, text: "Workflow de aprovação por alçadas" },
  { icon: MessageSquare, text: "Central de disputas em tempo real" },
  { icon: Users, text: "Gestão de usuários e permissões" },
];

export default function Acesso() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

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
            <h1 className="text-4xl font-bold leading-tight">
              Governança e Validação Fiscal
            </h1>
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

        <p className="text-primary-foreground/40 text-xs">
          © 2025 GovFiscal · Projeto Acadêmico
        </p>
      </div>

      {/* Painel direito — login */}
      <div className="flex-1 flex flex-col justify-center bg-background px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GovFiscal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Acesso ao sistema</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Selecione seu perfil de acesso para continuar
            </p>
          </div>

          <div className="space-y-3">
            {demos.map((d) => {
              const meta = ROLES[d.role];
              const initials = (d.user.nome || d.user.razao_social || "?")
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <button
                  key={d.role}
                  className="w-full text-left rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-sm transition-all duration-150 p-4 flex items-center justify-between group"
                  onClick={() => {
                    setSession(d.role, d.user);
                    navigate(d.dest);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${meta.color}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {d.user.nome || d.user.razao_social}
                        </span>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${meta.color}`}>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ambiente de demonstração · Dados fictícios para fins acadêmicos
          </p>
        </div>
      </div>
    </div>
  );
}
