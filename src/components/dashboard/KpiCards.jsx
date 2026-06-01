import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatBRL } from "@/lib/utils";

function bucketRejection(motivo) {
  const m = String(motivo || "").toLowerCase();
  if (m.includes("cnpj")) return "cnpj";
  if (m.includes("item_nao_contratado") || m.includes("não contratado") || m.includes("nao contratado")) return "item";
  if (m.includes("saldo")) return "saldo";
  if (m.includes("quantidade") || m.includes("valor")) return "valor";
  return "outros";
}

const cardDefs = [
  {
    key: "total",
    title: "Total de notas",
    icon: FileText,
    iconClass: "text-blue-600 bg-blue-50",
    valueClass: "text-foreground",
  },
  {
    key: "aprovadas",
    title: "Aprovadas",
    icon: CheckCircle2,
    iconClass: "text-emerald-600 bg-emerald-50",
    valueClass: "text-emerald-700",
  },
  {
    key: "pendentes",
    title: "Pendentes (fila)",
    icon: Clock,
    iconClass: "text-amber-600 bg-amber-50",
    valueClass: "text-amber-700",
  },
  {
    key: "rejeitadas",
    title: "Rejeitadas",
    icon: XCircle,
    iconClass: "text-red-600 bg-red-50",
    valueClass: "text-red-700",
  },
];

export default function KpiCards({ notas }) {
  const total = notas.length;
  const aprovadas = notas.filter((n) => n.status === "aprovada");
  const pendentes = notas.filter((n) => n.status === "pendente");
  const rejeitadas = notas.filter((n) => n.status === "rejeitada");

  const rej = { cnpj: 0, item: 0, valor: 0, saldo: 0, outros: 0 };
  rejeitadas.forEach((n) => { rej[bucketRejection(n.motivo_rejeicao)] += 1; });

  const somaAprovadas = aprovadas.reduce((acc, n) => acc + (n.valor_bruto || 0), 0);
  const somaPendentes = pendentes.reduce((acc, n) => acc + (n.valor_bruto || 0), 0);
  const somaRejeitadas = rejeitadas.reduce((acc, n) => acc + (n.valor_bruto || 0), 0);
  const somaTotal = notas.reduce((acc, n) => acc + (n.valor_bruto || 0), 0);

  const values = {
    total: { count: total, sub: formatBRL(somaTotal) },
    aprovadas: { count: aprovadas.length, sub: formatBRL(somaAprovadas) },
    pendentes: { count: pendentes.length, sub: formatBRL(somaPendentes) },
    rejeitadas: {
      count: rejeitadas.length,
      sub: `${formatBRL(somaRejeitadas)} · CNPJ ${rej.cnpj} · Itens ${rej.item} · Valor ${rej.valor} · Saldo ${rej.saldo}`,
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardDefs.map(({ key, title, icon: Icon, iconClass, valueClass }) => {
        const { count, sub } = values[key];
        return (
          <Card key={key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${valueClass}`}>{count}</div>
              <p className="mt-1 text-xs text-muted-foreground truncate" title={sub}>{sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
