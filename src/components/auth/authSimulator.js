const STORAGE_KEY = "govfiscal_demo_role";
const STORAGE_USER = "govfiscal_demo_user";

export const ROLES = {
  admin: { key: "admin", label: "Administrador", color: "text-red-600 bg-red-50 border-red-200" },
  gestor: { key: "gestor", label: "Gestor Financeiro", color: "text-amber-700 bg-amber-50 border-amber-200" },
  analista: { key: "analista", label: "Analista Financeiro", color: "text-blue-700 bg-blue-50 border-blue-200" },
  fornecedor: { key: "fornecedor", label: "Fornecedor", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

export function getRole() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setRole(role) {
  localStorage.setItem(STORAGE_KEY, role);
}

export function getDemoUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || "null");
  } catch {
    return null;
  }
}

export function setDemoUser(user) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

export function clearDemoSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_USER);
}

export function isAdmin() {
  return getRole() === "admin";
}

export function isGestor() {
  const r = getRole();
  return r === "gestor" || r === "admin";
}

export function isAnalista() {
  const r = getRole();
  return r === "analista" || r === "gestor" || r === "admin";
}

export function isFornecedor() {
  return getRole() === "fornecedor";
}

export function canAccessFornecedoresContratos() {
  return isGestor();
}

export function canAccessAlcadas() {
  return isGestor();
}

export function canAccessUsuarios() {
  return isAdmin();
}

export function canApprove() {
  return isGestor();
}

export function fornecedorCnpjLogado() {
  const u = getDemoUser();
  return u?.cnpj ? String(u.cnpj).replace(/\D/g, "") : "";
}
