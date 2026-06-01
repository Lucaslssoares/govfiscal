import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, FileText, Building2 } from "lucide-react";
import AprovacaoModal from "@/components/dashboard/AprovacaoModal.jsx";

function tempoEspera(dateStr) {
  if (!dateStr) return null;
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return null;
  }
}

export default function FilaAprovacao({ notas, alcadas, canApprove, onRefresh }) {
  const pendentes = notas.filter((n) => n.status === "pendente");
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Fila de aprovação</CardTitle>
        {pendentes.length > 0 && (
          <Badge variant="warning" className="text-xs">{pendentes.length} pendente{pendentes.length > 1 ? "s" : ""}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {pendentes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhuma nota pendente.</p>
          </div>
        )}
        {pendentes.map((n) => {
          const espera = tempoEspera(n.created_date);
          return (
            <div
              key={n.id}
              className="rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">NF {n.numero_nota}</span>
                    <Badge variant="warning" className="text-xs px-1.5 py-0">pendente</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{n.fornecedor_nome}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{n.numero_contrato}</span>
                    <span className="font-medium text-foreground">{formatBRL(n.valor_bruto)}</span>
                    {espera && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {espera}
                      </span>
                    )}
                  </div>
                  {n.protocolo && (
                    <p className="text-xs text-muted-foreground">Protocolo: {n.protocolo}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => { setSel(n); setOpen(true); }}
                >
                  Revisar
                </Button>
              </div>
            </div>
          );
        })}

        <AprovacaoModal
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) setSel(null); }}
          nota={sel}
          alcadas={alcadas}
          canApprove={canApprove}
          onApprove={async (nota) => {
            const { base44 } = await import("@/api/base44Client.js");
            await base44.entities.NotaFiscal.update(nota.id, { status: "aprovada", motivo_rejeicao: "" });
            onRefresh?.();
          }}
          onReject={async (nota, motivo) => {
            const { base44 } = await import("@/api/base44Client.js");
            await base44.entities.NotaFiscal.update(nota.id, { status: "rejeitada", motivo_rejeicao: motivo });
            await base44.entities.Disputa.create({
              nota_fiscal_id: nota.id,
              numero_nota: nota.numero_nota,
              fornecedor_nome: nota.fornecedor_nome,
              autor: "Gestor",
              papel: "gestor",
              mensagem: `Nota rejeitada na aprovação manual. Motivo: ${motivo}`,
            });
            onRefresh?.();
          }}
        />
      </CardContent>
    </Card>
  );
}
