import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout.jsx";
import { formatCnpj, onlyDigits } from "@/lib/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function CadastroFornecedores() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["fornecedores"], queryFn: () => base44.entities.Fornecedor.filter({}) });
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ razao_social: "", cnpj: "", email: "", telefone: "", endereco: "", responsavel: "", status: "ativo" });
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.razao_social, r.cnpj, r.email].join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, cnpj: onlyDigits(form.cnpj) };
      if (!payload.razao_social || !payload.cnpj) throw new Error("Razão social e CNPJ são obrigatórios.");
      if (editing) return base44.entities.Fornecedor.update(editing.id, payload);
      return base44.entities.Fornecedor.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success(editing ? "Fornecedor atualizado." : "Fornecedor cadastrado.");
      setEditing(null);
      setForm({ razao_social: "", cnpj: "", email: "", telefone: "", endereco: "", responsavel: "", status: "ativo" });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">CRUD com busca por razão social, CNPJ ou e-mail.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar fornecedor" : "Novo fornecedor"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Razão social *</Label>
              <Input value={form.razao_social} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ativo">ativo</option>
                <option value="inativo">inativo</option>
                <option value="suspenso">suspenso</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
                Salvar
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm({ razao_social: "", cnpj: "", email: "", telefone: "", endereco: "", responsavel: "", status: "ativo" });
                  }}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
            {save.error && <p className="text-sm text-red-600 md:col-span-2">{save.error.message}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Lista</CardTitle>
            <Input className="max-w-xs" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.razao_social}</TableCell>
                    <TableCell>{formatCnpj(r.cnpj)}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "ativo" ? "success" : "secondary"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(r);
                          setForm({ ...r, cnpj: formatCnpj(r.cnpj) });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          base44.entities.Fornecedor.delete(r.id).then(() => {
                            qc.invalidateQueries({ queryKey: ["fornecedores"] });
                            toast.success("Fornecedor removido.");
                          })
                        }
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
