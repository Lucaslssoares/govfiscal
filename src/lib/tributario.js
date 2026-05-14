/**
 * Motor tributário stateless — retenções por tipo de serviço (valores educacionais).
 */

const REGRAS = {
  servicos_ti: {
    tipo: "servicos_ti",
    descricao: "Serviços de TI / Software",
    retencoes: [
      { imposto: "ISS", aliquota: 0.05 },
      { imposto: "INSS", aliquota: 0.11 },
      { imposto: "IRRF", aliquota: 0.015 },
      { imposto: "CSLL", aliquota: 0.01 },
      { imposto: "PIS", aliquota: 0.0065 },
      { imposto: "COFINS", aliquota: 0.03 },
    ],
  },
  consultoria: {
    tipo: "consultoria",
    descricao: "Consultoria e Assessoria",
    retencoes: [
      { imposto: "ISS", aliquota: 0.05 },
      { imposto: "IRRF", aliquota: 0.015 },
      { imposto: "CSLL", aliquota: 0.01 },
      { imposto: "PIS", aliquota: 0.0065 },
      { imposto: "COFINS", aliquota: 0.03 },
    ],
  },
  limpeza: {
    tipo: "limpeza",
    descricao: "Limpeza e Conservação",
    retencoes: [
      { imposto: "ISS", aliquota: 0.03 },
      { imposto: "INSS", aliquota: 0.11 },
      { imposto: "IRRF", aliquota: 0.015 },
    ],
  },
  materiais: {
    tipo: "materiais",
    descricao: "Fornecimento de Materiais",
    retencoes: [
      { imposto: "PIS", aliquota: 0.0065 },
      { imposto: "COFINS", aliquota: 0.03 },
    ],
  },
  locacao: {
    tipo: "locacao",
    descricao: "Locação de Equipamentos",
    retencoes: [
      { imposto: "ISS", aliquota: 0.02 },
      { imposto: "IRRF", aliquota: 0.015 },
      { imposto: "PIS", aliquota: 0.0065 },
      { imposto: "COFINS", aliquota: 0.03 },
    ],
  },
  transporte: {
    tipo: "transporte",
    descricao: "Transporte",
    retencoes: [
      { imposto: "IRRF", aliquota: 0.011 },
      { imposto: "PIS", aliquota: 0.0065 },
      { imposto: "COFINS", aliquota: 0.03 },
    ],
  },
};

export const TIPOS_SERVICO = Object.keys(REGRAS);

/**
 * @param {number} valorBruto
 * @param {keyof typeof REGRAS} tipoServico
 */
export function calcularImpostos(valorBruto, tipoServico) {
  const regra = REGRAS[tipoServico] || REGRAS.servicos_ti;
  const base = Number(valorBruto) || 0;
  const retencoes = regra.retencoes.map((r) => ({
    imposto: r.imposto,
    aliquota: r.aliquota,
    valor: Math.round(base * r.aliquota * 100) / 100,
  }));
  const totalRetencoes = Math.round(retencoes.reduce((a, b) => a + b.valor, 0) * 100) / 100;
  const valorLiquido = Math.round((base - totalRetencoes) * 100) / 100;
  return {
    retencoes,
    totalRetencoes,
    valorLiquido,
    regra: { tipo: regra.tipo, descricao: regra.descricao, retencoes: regra.retencoes },
  };
}

export function labelTipoServico(key) {
  return REGRAS[key]?.descricao || key;
}
