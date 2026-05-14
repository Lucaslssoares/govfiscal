import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatCnpj } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoricoNotas({ notas }) {
  if (!notas?.length) {
    return <p className="text-sm text-muted-foreground">Nenhuma nota enviada ainda.</p>;
  }
  return (
    <div className="space-y-2">
      {notas.map((n) => (
        <Card key={n.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">NF {n.numero_nota}</CardTitle>
            <Badge
              variant={
                n.status === "aprovada" ? "success" : n.status === "rejeitada" ? "danger" : n.status === "pendente" ? "warning" : "secondary"
              }
            >
              {n.status}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Contrato: {n.numero_contrato}</span>
              <span>CNPJ: {formatCnpj(n.cnpj_emissor)}</span>
              <span>Valor: {formatBRL(n.valor_bruto)}</span>
              <span>
                Atualizado:{" "}
                {n.updated_date
                  ? format(parseISO(n.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "—"}
              </span>
            </div>
            {n.motivo_rejeicao && <p className="mt-2 text-red-700">{n.motivo_rejeicao}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
