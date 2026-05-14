import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/utils";

function downloadCsv(filename, content) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FechamentoLote() {
  const { data: notas = [] } = useQuery({ queryKey: ["notas"], queryFn: () => base44.entities.NotaFiscal.filter({}) });
  const aprovadas = useMemo(() => notas.filter((n) => n.status === "aprovada"), [notas]);
  const [sel, setSel] = useState(() => new Set());

  const selectedNotas = useMemo(() => aprovadas.filter((n) => sel.has(n.id)), [aprovadas, sel]);

  const totalVol = aprovadas.reduce((a, n) => a + (Number(n.valor_bruto) || 0), 0);
  const selVol = selectedNotas.reduce((a, n) => a + (Number(n.valor_bruto) || 0), 0);

  function toggle(id) {
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    if (sel.size === aprovadas.length) setSel(new Set());
    else setSel(new Set(aprovadas.map((n) => n.id)));
  }

  function exportar() {
    const stamp = format(new Date(), "yyyyMMdd_HHmm");
    const lines = [
      "Nº Nota;Fornecedor;CNPJ;Contrato;Valor Bruto;Data Aprovação",
      ...selectedNotas.map((n) => {
        const d = n.updated_date || n.created_date;
        const ds = d ? format(parseISO(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "";
        const vb = Number(n.valor_bruto).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${n.numero_nota};${n.fornecedor_nome};${n.cnpj_emissor};${n.numero_contrato};${vb};${ds}`;
      }),
    ];
    downloadCsv(`bordero_pagamento_${stamp}.csv`, lines.join("\n"));
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Fechamento e lotes</h1>
          <p className="text-sm text-muted-foreground">Selecione notas aprovadas e exporte o borderô CSV (UTF-8 BOM, separador ;).</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Notas aprovadas disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{aprovadas.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Volume total aprovado</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{formatBRL(totalVol)}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Selecionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{selectedNotas.length}</div>
              <p className="text-sm text-muted-foreground">{formatBRL(selVol)}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>Seleção</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {sel.size === aprovadas.length ? "Limpar seleção" : "Selecionar tudo"}
              </Button>
              <Button size="sm" onClick={exportar} disabled={!selectedNotas.length}>
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {aprovadas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma nota aprovada disponível.</p>}
            {aprovadas.map((n) => (
              <label key={n.id} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border p-3 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={sel.has(n.id)} onChange={() => toggle(n.id)} />
                  <div>
                    <p className="font-medium">NF {n.numero_nota}</p>
                    <p className="text-sm text-muted-foreground">
                      {n.fornecedor_nome} · {n.numero_contrato}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">{formatBRL(n.valor_bruto)}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
