import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function bucketRejection(motivo) {
  const m = String(motivo || "").toLowerCase();
  if (m.includes("cnpj")) return "cnpj";
  if (m.includes("item_nao_contratado") || m.includes("não contratado") || m.includes("nao contratado")) return "item";
  if (m.includes("saldo")) return "saldo";
  if (m.includes("quantidade") || m.includes("valor")) return "valor";
  return "outros";
}

export default function KpiCards({ notas }) {
  const total = notas.length;
  const aprovadas = notas.filter((n) => n.status === "aprovada").length;
  const pendentes = notas.filter((n) => n.status === "pendente").length;
  const rejeitadas = notas.filter((n) => n.status === "rejeitada");
  const rej = { cnpj: 0, item: 0, valor: 0, saldo: 0, outros: 0 };
  rejeitadas.forEach((n) => {
    const b = bucketRejection(n.motivo_rejeicao);
    rej[b] += 1;
  });

  const cards = [
    { title: "Total de notas", value: total },
    { title: "Aprovadas", value: aprovadas },
    { title: "Pendentes (fila)", value: pendentes },
    {
      title: "Rejeições (detalhe)",
      value: rejeitadas.length,
      sub: `CNPJ ${rej.cnpj} · Itens ${rej.item} · Valor/Qtd ${rej.valor} · Saldo ${rej.saldo} · Outros ${rej.outros}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{c.value}</div>
            {c.sub && <p className="mt-2 text-xs text-muted-foreground">{c.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
