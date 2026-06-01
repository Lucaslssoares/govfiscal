// Metadados de exibição por role — cores e labels usados em toda a UI.
// A sessão real é gerenciada pelo Supabase Auth (AuthContext.jsx).
export const ROLES = {
  admin:      { key: "admin",      label: "Administrador",       color: "text-red-600 bg-red-50 border-red-200" },
  gestor:     { key: "gestor",     label: "Gestor Financeiro",   color: "text-amber-700 bg-amber-50 border-amber-200" },
  analista:   { key: "analista",   label: "Analista Financeiro", color: "text-blue-700 bg-blue-50 border-blue-200" },
  fornecedor: { key: "fornecedor", label: "Fornecedor",          color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};
