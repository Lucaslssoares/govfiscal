import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { resolveAlcada } from "@/components/dashboard/AprovacaoModal.jsx";
import { ArrowRight } from "lucide-react";

export default function ConfigAlcadas() {
  const qc = useQueryClient();
  const { data: alcadas = [] } = useQuery({ queryKey: ["alcadas"], queryFn: () => base44.entities.Alcada.filter({}) });
  const sorted = [...alcadas].sort((a, b) => Number(a.valor_min) - Number(b.valor_min));
  const activeFlow = sorted.filter((a) => a.ativo);

  const [form, setForm] = useState({
    nivel: "",
    valor_min: 0,
    valor_max: 0,
    responsavel: "",
    email_responsavel: "",
    ativo: true,
  });
  const [editing, setEditing] = useState(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.nivel || !form.responsavel) throw new Error("Nível e responsável são obrigatórios.");
      const payload = { ...form, valor_min: Number(form.valor_min), valor_max: Number(form.valor_max) };
      if (editing) return base44.entities.Alcada.update(editing.id, payload);
      return base44.entities.Alcada.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alcadas"] });
      setEditing(null);
      setForm({ nivel: "", valor_min: 0, valor_max: 0, responsavel: "", email_responsavel: "", ativo: true });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alçadas de aprovação</h1>
          <p className="text-sm text-muted-foreground">Faixas de valor com responsáveis. Valor máximo 0 = sem limite superior.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fluxo visual (ativas)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            {activeFlow.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma alçada ativa.</p>}
            {activeFlow.map((a, idx) => (
              <div key={a.id} className="flex items-center gap-2">
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm">
                  <p className="font-semibold">{a.nivel}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {Number(a.valor_min).toLocaleString("pt-BR")} → {Number(a.valor_max) === 0 ? "∞" : `R$ ${Number(a.valor_max).toLocaleString("pt-BR")}`}
                  </p>
                  <p className="text-xs">{a.responsavel}</p>
                </div>
                {idx < activeFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar alçada" : "Nova alçada"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nível *</Label>
              <Input value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Responsável *</Label>
              <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Valor mínimo (inclusivo)</Label>
              <Input type="number" value={form.valor_min} onChange={(e) => setForm({ ...form, valor_min: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Valor máximo (0 = sem limite)</Label>
              <Input type="number" value={form.valor_max} onChange={(e) => setForm({ ...form, valor_max: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>E-mail do responsável</Label>
              <Input value={form.email_responsavel} onChange={(e) => setForm({ ...form, email_responsavel: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="ativo" type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <Label htmlFor="ativo">Alçada ativa</Label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
                Salvar
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ nivel: "", valor_min: 0, valor_max: 0, responsavel: "", email_responsavel: "", ativo: true }); }}>
                  Cancelar
                </Button>
              )}
            </div>
            {save.error && <p className="text-sm text-red-600 md:col-span-2">{save.error.message}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nível</TableHead>
                  <TableHead>Faixa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead>Exemplo (R$ 12k)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((a) => {
                  const hit = resolveAlcada(12000, [a]);
                  return (
                    <TableRow key={a.id} className={a.ativo ? "" : "opacity-50"}>
                      <TableCell className="font-medium">{a.nivel}</TableCell>
                      <TableCell>
                        {Number(a.valor_min).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} →{" "}
                        {Number(a.valor_max) === 0 ? "∞" : Number(a.valor_max).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell>{a.responsavel}</TableCell>
                      <TableCell>
                        <Badge variant={a.ativo ? "success" : "secondary"}>{a.ativo ? "sim" : "não"}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{hit?.nivel || "—"}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => { setEditing(a); setForm({ ...a }); }}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => base44.entities.Alcada.delete(a.id).then(() => qc.invalidateQueries({ queryKey: ["alcadas"] }))}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
