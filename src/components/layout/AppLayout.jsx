import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, ClipboardList, Scale, MessageSquare, LogOut, Building2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext.jsx";
import { ROLES } from "@/components/auth/authSimulator";
import { cn } from "@/lib/utils";

const linkClass = ({ isActive }) =>
  cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted");

export default function AppLayout({ children }) {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const meta = ROLES[role] || { label: role || "—", color: "text-foreground bg-muted border-border" };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
              Gov<span className="text-primary">Fiscal</span>
            </Link>
            <span className={cn("hidden rounded-md border px-2 py-1 text-xs sm:inline-flex", meta.color)}>{meta.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden md:inline">{user?.nome || user?.razao_social || "—"}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate("/acesso");
              }}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {role === "fornecedor" && (
              <NavLink to="/fornecedor" className={linkClass}>
                <FileText className="h-4 w-4" />
                Portal do Fornecedor
              </NavLink>
            )}
            {(role === "admin" || role === "gestor") && (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/fornecedores" className={linkClass}>
                  <Building2 className="h-4 w-4" />
                  Fornecedores
                </NavLink>
                <NavLink to="/contratos" className={linkClass}>
                  <ClipboardList className="h-4 w-4" />
                  Contratos
                </NavLink>
                <NavLink to="/alcadas" className={linkClass}>
                  <Scale className="h-4 w-4" />
                  Alçadas
                </NavLink>
                <NavLink to="/fechamento" className={linkClass}>
                  <FileText className="h-4 w-4" />
                  Fechamento
                </NavLink>
              </>
            )}
            {["admin", "gestor", "analista", "fornecedor"].includes(role) && (
              <NavLink to="/disputas" className={linkClass}>
                <MessageSquare className="h-4 w-4" />
                Disputas
              </NavLink>
            )}
            {role === "admin" && (
              <NavLink to="/usuarios" className={linkClass}>
                <UserCog className="h-4 w-4" />
                Usuários
              </NavLink>
            )}
          </nav>
          <p className="mt-6 text-xs text-muted-foreground">Demo acadêmica — dados em localStorage.</p>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
