/**
 * Validação de Chave de Acesso NF-e / NFC-e
 * Estrutura (44 dígitos): cUF(2) AAMM(4) CNPJ(14) mod(2) serie(3) nNF(9) tpEmis(1) cNF(8) cDV(1)
 */

function calcDigitoVerificador(chave42) {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let pesoIdx = 0;
  for (let i = chave42.length - 1; i >= 0; i--) {
    soma += parseInt(chave42[i]) * pesos[pesoIdx % 8];
    pesoIdx++;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/**
 * Valida formato e dígito verificador da chave de acesso.
 * @param {string} chave — 44 dígitos (espaços e hífens são ignorados)
 * @returns {{ valida: boolean, motivo: string|null }}
 */
export function validarChaveAcesso(chave) {
  if (!chave) return { valida: false, motivo: "Chave de acesso não informada" };
  const digits = chave.replace(/\D/g, "");

  if (digits.length !== 44) {
    return { valida: false, motivo: `Chave deve ter 44 dígitos (informado: ${digits.length})` };
  }

  const mod = digits.substring(20, 22);
  if (mod !== "55" && mod !== "65") {
    return { valida: false, motivo: `Modelo inválido (${mod}). Esperado 55 = NF-e ou 65 = NFC-e` };
  }

  const dvInformado = parseInt(digits[43]);
  const dvCalculado = calcDigitoVerificador(digits.substring(0, 43));
  if (dvInformado !== dvCalculado) {
    return {
      valida: false,
      motivo: `Dígito verificador incorreto — informado: ${dvInformado}, calculado: ${dvCalculado}`,
    };
  }

  return { valida: true, motivo: null };
}

/**
 * Extrai o CNPJ do emissor embutido na chave de acesso.
 * @param {string} chave
 * @returns {string|null} 14 dígitos ou null
 */
export function extrairCnpjDaChave(chave) {
  const digits = chave.replace(/\D/g, "");
  return digits.length >= 20 ? digits.substring(6, 20) : null;
}

/**
 * Decompõe a chave em campos individuais.
 * @param {string} chave
 * @returns {object|null}
 */
export function extrairCamposDaChave(chave) {
  const d = chave.replace(/\D/g, "");
  if (d.length !== 44) return null;
  return {
    cUF: d.substring(0, 2),
    AAMM: d.substring(2, 6),
    CNPJ: d.substring(6, 20),
    mod: d.substring(20, 22),
    serie: d.substring(22, 25),
    nNF: d.substring(25, 34),
    tpEmis: d.substring(34, 35),
    cNF: d.substring(35, 43),
    cDV: d.substring(43, 44),
  };
}

/**
 * Simula consulta ao webservice da SEFAZ (validação local de formato + status por demo).
 * Em produção substituir por fetch ao proxy n8n → SEFAZ.
 * @param {string} chave
 * @returns {Promise<{ status: string, situacao: string, motivo: string|null }>}
 */
export async function consultarSefaz(chave) {
  await new Promise((r) => setTimeout(r, 400));

  const validacao = validarChaveAcesso(chave);
  if (!validacao.valida) {
    return { status: "invalida", situacao: "Chave inválida", motivo: validacao.motivo };
  }

  const d = chave.replace(/\D/g, "");
  const cNF = d.substring(35, 43);

  // Simulação de cancelamento / inutilização para fins de demonstração
  if (cNF.startsWith("00000")) {
    return { status: "cancelada", situacao: "Uso cancelado", motivo: "NF-e cancelada pelo emissor" };
  }
  if (cNF.startsWith("99999")) {
    return { status: "inutilizada", situacao: "Número inutilizado", motivo: "Faixa de numeração inutilizada" };
  }

  return { status: "autorizada", situacao: "Autorizado o uso da NF-e", motivo: null };
}

/**
 * Formata a chave para exibição em grupos de 4 dígitos.
 * @param {string} chave
 * @returns {string}
 */
export function formatarChaveAcesso(chave) {
  const d = chave.replace(/\D/g, "");
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
