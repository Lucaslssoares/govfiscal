import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatCnpj } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const PAGE = 8;

export default function AuditoriaTable({ notas }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return notas;
    return notas.filter((n) =>
      [n.numero_nota, n.numero_contrato, n.fornecedor_nome, n.cnpj_emissor, n.status, n.motivo_rejeicao]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [notas, q]);

  const slice = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Auditoria de notas</p>
        <Input placeholder="Buscar…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="max-w-sm" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NF</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Contrato</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.map((n) => (
            <TableRow key={n.id}>
              <TableCell className="font-medium">{n.numero_nota}</TableCell>
              <TableCell>{n.fornecedor_nome}</TableCell>
              <TableCell>{formatCnpj(n.cnpj_emissor)}</TableCell>
              <TableCell>{n.numero_contrato}</TableCell>
              <TableCell>{formatBRL(n.valor_bruto)}</TableCell>
              <TableCell>
                <Badge variant={n.status === "aprovada" ? "success" : n.status === "rejeitada" ? "danger" : "warning"}>{n.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {n.updated_date ? format(parseISO(n.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page + 1} de {pages} · {filtered.length} registro(s)
        </span>
        <div className="flex gap-2">
          <button type="button" className="rounded border px-2 py-1 hover:bg-muted" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Anterior
          </button>
          <button
            type="button"
            className="rounded border px-2 py-1 hover:bg-muted"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
