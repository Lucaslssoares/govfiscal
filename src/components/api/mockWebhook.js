import { onlyDigits } from "@/lib/utils";
import { validarChaveAcesso, extrairCnpjDaChave, consultarSefaz } from "@/lib/nfeValidation";

const TOLERANCE = 0.01;

function parseItens(json) {
  try {
    const arr = JSON.parse(json || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function normCode(c) {
  return String(c || "").trim().toUpperCase();
}

/**
 * Two-Way Matching com validação de Chave de Acesso NF-e.
 * Etapas: 1) formato da chave → 2) consulta SEFAZ (simulada) → 3) CNPJ → 4) itens → 5) saldo
 * @param {{ cabecalho: object, items: object[], valor_bruto_total: number }} payload
 * @param {object} contrato
 */
export async function enviarNotaFiscal(payload, contrato) {
  await new Promise((r) => setTimeout(r, 600));

  // ── 1. Chave de acesso: presença e formato ────────────────────────────────
  const chave = payload?.cabecalho?.chave_acesso || "";
  if (!chave) {
    return {
      success: false,
      tipo_rejeicao: "chave_acesso_ausente",
      motivo: "Chave de acesso da NF-e não informada. Informe os 44 dígitos.",
    };
  }

  const validacaoChave = validarChaveAcesso(chave);
  if (!validacaoChave.valida) {
    return {
      success: false,
      tipo_rejeicao: "chave_acesso_invalida",
      motivo: `Chave de acesso inválida: ${validacaoChave.motivo}`,
    };
  }

  // ── 2. Consulta SEFAZ (simulada) — verifica situação da NF-e ─────────────
  const sefaz = await consultarSefaz(chave);
  if (sefaz.status !== "autorizada") {
    return {
      success: false,
      tipo_rejeicao: `sefaz_${sefaz.status}`,
      motivo: `SEFAZ: ${sefaz.situacao}. ${sefaz.motivo || ""}`.trim(),
    };
  }

  // ── 3. CNPJ embutido na chave deve coincidir com o contrato ───────────────
  const cnpjDaChave = extrairCnpjDaChave(chave);
  const cnpjContrato = onlyDigits(contrato?.cnpj_fornecedor);

  if (cnpjDaChave !== cnpjContrato) {
    return {
      success: false,
      tipo_rejeicao: "cnpj_invalido",
      motivo: `CNPJ embutido na chave (${cnpjDaChave}) não confere com o CNPJ do contrato (${cnpjContrato}).`,
    };
  }

  // Confirmação secundária: CNPJ declarado no cabeçalho
  const cnpjNota = onlyDigits(payload?.cabecalho?.cnpj_emissor);
  if (cnpjNota !== cnpjContrato) {
    return {
      success: false,
      tipo_rejeicao: "cnpj_invalido",
      motivo: `CNPJ do emissor (${cnpjNota}) não confere com o CNPJ do contrato (${cnpjContrato}).`,
    };
  }

  // ── 4. Matching de itens ──────────────────────────────────────────────────
  const itensContrato = parseItens(contrato.itens_json);
  const mapContrato = new Map(itensContrato.map((it) => [normCode(it.codigo), it]));

  for (const item of payload.items || []) {
    const code = normCode(item.codigo);
    const ic = mapContrato.get(code);
    if (!ic) {
      return {
        success: false,
        tipo_rejeicao: "item_nao_contratado",
        motivo: `Item não contratado: ${item.codigo}`,
      };
    }
    const vu = Number(item.valor_unitario);
    if (vu > Number(ic.valor_unitario) + TOLERANCE) {
      return {
        success: false,
        tipo_rejeicao: "divergencia_valor",
        motivo: `Valor unitário acima do contratado no item ${item.codigo}. Informado: R$ ${vu.toFixed(2)}; máximo: R$ ${Number(ic.valor_unitario).toFixed(2)} (+ tolerância R$ 0,01).`,
      };
    }
    const q = Number(item.quantidade);
    if (q > Number(ic.quantidade_maxima)) {
      return {
        success: false,
        tipo_rejeicao: "divergencia_valor",
        motivo: `Quantidade acima do máximo contratado no item ${item.codigo}. Informado: ${q}; máximo: ${ic.quantidade_maxima}.`,
      };
    }
  }

  // ── 5. Saldo disponível no contrato ──────────────────────────────────────
  const total = Number(payload.valor_bruto_total);
  const saldo = Number(contrato.saldo_disponivel);
  if (total > saldo) {
    return {
      success: false,
      tipo_rejeicao: "divergencia_valor",
      motivo: `Valor bruto (R$ ${total.toFixed(2)}) excede o saldo disponível do contrato (R$ ${saldo.toFixed(2)}).`,
    };
  }

  const protocolo = `PROT-${Date.now()}`;
  return { success: true, protocolo, sefaz_situacao: sefaz.situacao };
}

/*
// Integração n8n (exemplo):
export async function enviarNotaFiscal(payload, contrato) {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (!url) return legacyLocalMatching(payload, contrato);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, contrato }),
  });
  return await response.json();
}
*/
