import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatCnpj } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

const PAGE = 8;

const STATUS_VARIANT = {
  aprovada: "success",
  rejeitada: "danger",
  pendente: "warning",
};

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return sort.dir === "asc"
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />;
}

function exportCsv(notas) {
  const header = ["NF", "Fornecedor", "CNPJ", "Contrato", "Valor (R$)", "Status", "Atualizado"];
  const rows = notas.map((n) => [
    n.numero_nota ?? "",
    n.fornecedor_nome ?? "",
    formatCnpj(n.cnpj_emissor),
    n.numero_contrato ?? "",
    String(n.valor_bruto ?? ""),
    n.status ?? "",
    n.updated_date ? format(parseISO(n.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria_${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditoriaTable({ notas }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ col: "updated_date", dir: "desc" });

  const toggleSort = (col) =>
    setSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s
      ? notas.filter((n) =>
          [n.numero_nota, n.numero_contrato, n.fornecedor_nome, n.cnpj_emissor, n.status, n.motivo_rejeicao]
            .join(" ").toLowerCase().includes(s)
        )
      : notas;

    return [...base].sort((a, b) => {
      let va = a[sort.col] ?? "";
      let vb = b[sort.col] ?? "";
      if (sort.col === "valor_bruto") { va = Number(va); vb = Number(vb); }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [notas, q, sort]);

  const slice = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const th = (col, label) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap hover:text-foreground"
      onClick={() => { toggleSort(col); setPage(0); }}
    >
      {label}<SortIcon col={col} sort={sort} />
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Auditoria de notas</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)} title="Exportar CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {th("numero_nota", "NF")}
            {th("fornecedor_nome", "Fornecedor")}
            <TableHead>CNPJ</TableHead>
            {th("numero_contrato", "Contrato")}
            {th("valor_bruto", "Valor")}
            {th("status", "Status")}
            {th("updated_date", "Atualizado")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma nota encontrada.
              </TableCell>
            </TableRow>
          )}
          {slice.map((n) => (
            <TableRow key={n.id}>
              <TableCell className="font-medium">{n.numero_nota}</TableCell>
              <TableCell>{n.fornecedor_nome}</TableCell>
              <TableCell className="text-muted-foreground">{formatCnpj(n.cnpj_emissor)}</TableCell>
              <TableCell>{n.numero_contrato}</TableCell>
              <TableCell className="font-medium">{formatBRL(n.valor_bruto)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[n.status] ?? "secondary"}>{n.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {n.updated_date ? format(parseISO(n.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Página {page + 1} de {pages} · {filtered.length} registro(s)</span>
        <div className="flex gap-2">
          <button type="button" className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:opacity-40" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            ← Anterior
          </button>
          <button type="button" className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:opacity-40" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
