import { onlyDigits } from "@/lib/utils";

const DB_KEY = "govfiscal_local_db";

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seedDatabase() {
  const fornecedorId = uid("forn");
  const cnpjAlfa = "12345678000190";
  return {
    Fornecedor: [
      {
        id: fornecedorId,
        razao_social: "Empresa Alfa Ltda",
        cnpj: cnpjAlfa,
        email: "contato@empresaalfa.com.br",
        telefone: "1133334444",
        endereco: "Av. Paulista, 1000 — São Paulo/SP",
        responsavel: "João Silva",
        status: "ativo",
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
    ],
    Contrato: [
      {
        id: uid("ctr"),
        numero_contrato: "CTR-2025-001",
        fornecedor_nome: "Empresa Alfa Ltda",
        cnpj_fornecedor: cnpjAlfa,
        descricao: "Desenvolvimento de software e suporte",
        valor_total: 100000,
        saldo_disponivel: 50000,
        status: "ativo",
        data_inicio: "2025-01-01",
        data_fim: "2025-12-31",
        itens_json: JSON.stringify([
          {
            codigo: "SRV-001",
            descricao: "Desenvolvimento de Software",
            unidade: "hora",
            valor_unitario: 150,
            quantidade_maxima: 200,
          },
          {
            codigo: "SRV-002",
            descricao: "Consultoria Técnica",
            unidade: "hora",
            valor_unitario: 200,
            quantidade_maxima: 50,
          },
        ]),
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
    ],
    NotaFiscal: [],
    Alcada: [
      {
        id: uid("alc"),
        nivel: "Analista Financeiro",
        valor_min: 0,
        valor_max: 5000,
        responsavel: "Carlos Mendes",
        email_responsavel: "carlos@empresa.com",
        ativo: true,
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
      {
        id: uid("alc"),
        nivel: "Coordenador Financeiro",
        valor_min: 5000.01,
        valor_max: 50000,
        responsavel: "Maria Santos",
        email_responsavel: "maria@empresa.com",
        ativo: true,
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
      {
        id: uid("alc"),
        nivel: "Diretor Financeiro",
        valor_min: 50000.01,
        valor_max: 0,
        responsavel: "João Oliveira",
        email_responsavel: "joao@empresa.com",
        ativo: true,
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
    ],
    Disputa: [],
    AppUser: [
      {
        id: uid("usr"),
        nome: "Ana Souza",
        email: "ana@empresa.com",
        role: "admin",
        status: "ativo",
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
      {
        id: uid("usr"),
        nome: "Carlos Mendes",
        email: "carlos@empresa.com",
        role: "gestor",
        status: "ativo",
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: "system",
      },
    ],
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const s = seedDatabase();
      localStorage.setItem(DB_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    const s = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(s));
    return s;
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function matchesFilter(row, query) {
  if (!query || typeof query !== "object") return true;
  return Object.entries(query).every(([k, v]) => {
    if (v === undefined || v === null) return true;
    if (Array.isArray(v)) return v.includes(row[k]);
    return row[k] === v;
  });
}

function createEntityApi(table) {
  return {
    async filter(query = {}) {
      const db = loadDb();
      const rows = db[table] || [];
      return rows.filter((r) => matchesFilter(r, query));
    },
    async create(data) {
      const db = loadDb();
      const row = {
        ...data,
        id: data.id || uid(table.slice(0, 3).toLowerCase()),
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: data.created_by || "demo",
      };
      db[table] = db[table] || [];
      db[table].push(row);
      saveDb(db);
      return row;
    },
    async update(id, patch) {
      const db = loadDb();
      const rows = db[table] || [];
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`${table} não encontrado`);
      rows[idx] = { ...rows[idx], ...patch, id, updated_date: nowIso() };
      saveDb(db);
      return rows[idx];
    },
    async delete(id) {
      const db = loadDb();
      db[table] = (db[table] || []).filter((r) => r.id !== id);
      saveDb(db);
      return { ok: true };
    },
  };
}

const integrations = {
  Core: {
    async SendEmail({ to, subject, body }) {
      // Demo: sem servidor SMTP — log no console
      console.info("[GovFiscal SendEmail]", { to, subject, body: body?.slice?.(0, 200) });
      return { success: true };
    },
    async UploadFile({ file, name }) {
      if (!file) return { url: "", name: name || "" };
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result || "");
          resolve({ url, name: name || file.name });
        };
        reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
        reader.readAsDataURL(file);
      });
    },
  },
};

const users = {
  async inviteUser(email, role) {
    const nome = email.split("@")[0];
    await entities.AppUser.create({
      nome,
      email,
      role: role || "gestor",
      status: "convidado",
    });
    return { ok: true };
  },
};

const entities = {
  Fornecedor: createEntityApi("Fornecedor"),
  Contrato: createEntityApi("Contrato"),
  NotaFiscal: createEntityApi("NotaFiscal"),
  Alcada: createEntityApi("Alcada"),
  Disputa: createEntityApi("Disputa"),
  AppUser: createEntityApi("AppUser"),
};

/**
 * Cliente compatível com o padrão Base44 (demo persiste em localStorage).
 * Para produção, substitua por SDK real do Base44.
 */
export const base44 = {
  entities,
  integrations,
  users,
};

export async function findContratoByNumero(numero) {
  const list = await entities.Contrato.filter({ numero_contrato: numero });
  return list[0] || null;
}

export async function listContratosAtivosForCnpj(cnpjDigits) {
  const c = onlyDigits(cnpjDigits);
  const all = await entities.Contrato.filter({});
  return all.filter((ct) => {
    if (ct.status !== "ativo") return false;
    if (!ct.cnpj_fornecedor) return false;
    return onlyDigits(ct.cnpj_fornecedor) === c;
  });
}

export function resetDemoDatabase() {
  localStorage.removeItem(DB_KEY);
  loadDb();
}
