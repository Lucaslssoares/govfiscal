import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatBRL, formatCnpj } from "@/lib/utils";

export function resolveAlcada(valor, alcadas) {
  const active = (alcadas || [])
    .filter((a) => a.ativo)
    .sort((a, b) => Number(a.valor_min) - Number(b.valor_min));
  const v = Number(valor);
  for (const a of active) {
    const max = Number(a.valor_max) === 0 ? Infinity : Number(a.valor_max);
    if (v >= Number(a.valor_min) && v <= max) return a;
  }
  return null;
}

export default function AprovacaoModal({ open, onOpenChange, nota, alcadas, canApprove, onApprove, onReject }) {
  const [motivo, setMotivo] = useState("");
  const alcada = useMemo(() => resolveAlcada(nota?.valor_bruto, alcadas), [nota, alcadas]);

  function close() {
    setMotivo("");
    onOpenChange(false);
  }

  if (!nota) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aprovação da nota {nota.numero_nota}</DialogTitle>
          <DialogDescription>Revise os dados antes de decidir.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fornecedor</span>
            <span className="font-medium">{nota.fornecedor_nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CNPJ</span>
            <span>{formatCnpj(nota.cnpj_emissor)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contrato</span>
            <span>{nota.numero_contrato}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor bruto</span>
            <span className="font-semibold">{formatBRL(nota.valor_bruto)}</span>
          </div>
          {alcada ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <p className="text-xs font-semibold uppercase">Alçada sugerida</p>
              <p className="text-sm">
                {alcada.nivel} — {alcada.responsavel} ({alcada.email_responsavel || "sem e-mail"})
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-700">Nenhuma alçada ativa cobre este valor.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Motivo (obrigatório para rejeição)</Label>
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo em caso de rejeição" />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={close}>
            Fechar
          </Button>
          {canApprove && (
            <>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!motivo.trim()) return;
                  await onReject?.(nota, motivo.trim());
                  close();
                }}
              >
                Rejeitar
              </Button>
              <Button
                onClick={async () => {
                  await onApprove?.(nota);
                  close();
                }}
              >
                Aprovar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
