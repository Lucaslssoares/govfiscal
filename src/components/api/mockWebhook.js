import { onlyDigits } from "@/lib/utils";

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
 * Two-Way Matching local. Substitua por fetch ao n8n (veja comentário no final).
 * @param {{ cabecalho: object, items: object[], valor_bruto_total: number }} payload
 * @param {object} contrato
 */
export async function enviarNotaFiscal(payload, contrato) {
  await new Promise((r) => setTimeout(r, 600));

  const cnpjNota = onlyDigits(payload?.cabecalho?.cnpj_emissor);
  const cnpjContrato = onlyDigits(contrato?.cnpj_fornecedor);

  if (cnpjNota !== cnpjContrato) {
    return {
      success: false,
      tipo_rejeicao: "cnpj_invalido",
      motivo: `CNPJ da nota (${cnpjNota}) não confere com o CNPJ do contrato (${cnpjContrato}).`,
    };
  }

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
  return { success: true, protocolo };
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
