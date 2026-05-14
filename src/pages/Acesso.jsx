import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext.jsx";
import { ROLES } from "@/components/auth/authSimulator";

const demos = [
  {
    role: "admin",
    title: "Administrador",
    desc: "Acesso total, inclusive usuários.",
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
    desc: "Central de disputas e acompanhamento.",
    user: { nome: "Mariana Costa", email: "mariana@empresa.com" },
    dest: "/disputas",
  },
  {
    role: "fornecedor",
    title: "Fornecedor",
    desc: "Portal isolado por CNPJ (demo: Empresa Alfa).",
    user: { nome: "Empresa Alfa Ltda", razao_social: "Empresa Alfa Ltda", email: "contato@empresaalfa.com.br", cnpj: "12345678000190" },
    dest: "/fornecedor",
  },
];

export default function Acesso() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GovFiscal</h1>
        <p className="text-muted-foreground">Portal de Governança e Validação Fiscal — acesso demo (sem senha).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {demos.map((d) => {
          const meta = ROLES[d.role];
          return (
            <Card key={d.role} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 text-xs ${meta.color}`}>{meta.label}</span>
                  {d.title}
                </CardTitle>
                <CardDescription>{d.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSession(d.role, d.user);
                    navigate(d.dest);
                  }}
                >
                  Entrar como {d.user.nome || d.user.razao_social}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
