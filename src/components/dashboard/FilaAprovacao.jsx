import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import AprovacaoModal from "@/components/dashboard/AprovacaoModal.jsx";

export default function FilaAprovacao({ notas, alcadas, canApprove, onRefresh }) {
  const pendentes = notas.filter((n) => n.status === "pendente");
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fila de aprovação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma nota pendente.</p>}
        {pendentes.map((n) => (
          <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">
                NF {n.numero_nota}{" "}
                <Badge variant="warning" className="ml-2">
                  pendente
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                {n.fornecedor_nome} · {n.numero_contrato} · {formatBRL(n.valor_bruto)}
              </p>
              {n.protocolo && <p className="text-xs text-muted-foreground">Protocolo: {n.protocolo}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => { setSel(n); setOpen(true); }}>
              Revisar
            </Button>
          </div>
        ))}
        <AprovacaoModal
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setSel(null);
          }}
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
