import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext.jsx";
import Acesso from "@/pages/Acesso.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import CadastroFornecedores from "@/pages/CadastroFornecedores.jsx";
import CadastroContratos from "@/pages/CadastroContratos.jsx";
import ConfigAlcadas from "@/pages/ConfigAlcadas.jsx";
import FechamentoLote from "@/pages/FechamentoLote.jsx";
import CentralDisputas from "@/pages/CentralDisputas.jsx";
import GestaoUsuarios from "@/pages/GestaoUsuarios.jsx";
import Fornecedor from "@/pages/Fornecedor.jsx";
import PageNotFound from "@/lib/PageNotFound.jsx";

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function RequireRole({ allow, children }) {
  const { role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!role) return <Navigate to="/acesso" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!role) return <Navigate to="/acesso" replace />;
  if (role === "fornecedor") return <Navigate to="/fornecedor" replace />;
  if (role === "analista")   return <Navigate to="/disputas" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AcessoGuard() {
  const { role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (role)   return <HomeRedirect />;
  return <Acesso />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/acesso" element={<AcessoGuard />} />
      <Route path="/"       element={<HomeRedirect />} />

      <Route path="/dashboard"   element={<RequireRole allow={["admin","gestor"]}><Dashboard /></RequireRole>} />
      <Route path="/fornecedores"element={<RequireRole allow={["admin","gestor"]}><CadastroFornecedores /></RequireRole>} />
      <Route path="/contratos"   element={<RequireRole allow={["admin","gestor"]}><CadastroContratos /></RequireRole>} />
      <Route path="/alcadas"     element={<RequireRole allow={["admin","gestor"]}><ConfigAlcadas /></RequireRole>} />
      <Route path="/fechamento"  element={<RequireRole allow={["admin","gestor"]}><FechamentoLote /></RequireRole>} />
      <Route path="/disputas"    element={<RequireRole allow={["admin","gestor","analista","fornecedor"]}><CentralDisputas /></RequireRole>} />
      <Route path="/usuarios"    element={<RequireRole allow={["admin"]}><GestaoUsuarios /></RequireRole>} />
      <Route path="/fornecedor"  element={<RequireRole allow={["fornecedor"]}><Fornecedor /></RequireRole>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
