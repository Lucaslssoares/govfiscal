import { supabase } from "@/lib/supabaseClient";
import { onlyDigits } from "@/lib/utils";

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

const TABLE_MAP = {
  Fornecedor: "fornecedor",
  Contrato: "contrato",
  NotaFiscal: "nota_fiscal",
  Alcada: "alcada",
  Disputa: "disputa",
  AppUser: "app_user",
};

function createEntityApi(entityName) {
  const table = TABLE_MAP[entityName];

  return {
    async filter(query = {}) {
      let q = supabase.from(table).select("*");
      if (query && typeof query === "object") {
        Object.entries(query).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (Array.isArray(v)) q = q.in(k, v);
          else q = q.eq(k, v);
        });
      }
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data || [];
    },

    async create(data) {
      const row = {
        ...data,
        id: data.id || uid(entityName.slice(0, 3).toLowerCase()),
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: data.created_by || "demo",
      };
      const { data: result, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return result;
    },

    async update(id, patch) {
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...patch, updated_date: nowIso() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return result;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  };
}

const integrations = {
  Core: {
    async SendEmail({ to, subject, body }) {
      console.info("[GovFiscal SendEmail]", { to, subject, body: body?.slice?.(0, 200) });
      return { success: true };
    },
    async UploadFile({ file, name }) {
      if (!file) return { url: "", name: name || "" };
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: String(reader.result || ""), name: name || file.name });
        reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
        reader.readAsDataURL(file);
      });
    },
  },
};

const entities = {
  Fornecedor: createEntityApi("Fornecedor"),
  Contrato:   createEntityApi("Contrato"),
  NotaFiscal: createEntityApi("NotaFiscal"),
  Alcada:     createEntityApi("Alcada"),
  Disputa:    createEntityApi("Disputa"),
  AppUser:    createEntityApi("AppUser"),
};

const users = {
  async inviteUser(email, role) {
    const nome = email.split("@")[0];
    await entities.AppUser.create({ nome, email, role: role || "gestor", status: "convidado" });
    return { ok: true };
  },
};

export const base44 = { entities, integrations, users };

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
  console.info("[GovFiscal] resetDemoDatabase: sem efeito no modo Supabase.");
}
