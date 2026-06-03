export const notificacoesMock = [
  {
    id: 1,
    mensagem: "NF-001 aprovada",
    tipo: "aprovacao",
    origem: "Dashboard",
    lida: false,
    data: "2026-06-03 09:30"
  },
  {
    id: 2,
    mensagem: "Nova disputa aberta para NF-005",
    tipo: "disputa",
    origem: "CentralDisputas",
    lida: false,
    data: "2026-06-03 10:15"
  }
];

export function contarNaoLidas(notificacoes) {
  return notificacoes.filter(n => !n.lida).length;
}

export function marcarComoLida(id, notificacoes) {
  return notificacoes.map(n =>
    n.id === id
      ? { ...n, lida: true }
      : n
  );
}

export function gerarNotificacao(mensagem, tipo, origem) {
  return {
    id: Date.now(),
    mensagem,
    tipo,
    origem,
    lida: false,
    data: new Date().toLocaleString()
  };
}
