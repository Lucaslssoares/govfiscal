import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import ItensContratoEditor from "@/components/cadastros/ItensContratoEditor.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCnpj, onlyDigits } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

function parseItens(json) {
  try {
    const a = JSON.parse(json || "[]");
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export default function CadastroContratos() {
  const qc = useQueryClient();
  const { data: contratos = [] } = useQuery({ queryKey: ["contratos"], queryFn: () => base44.entities.Contrato.filter({}) });
  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: () => base44.entities.Fornecedor.filter({}) });
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({
    numero_contrato: "",
    fornecedor_nome: "",
    cnpj_fornecedor: "",
    descricao: "",
    valor_total: 0,
    saldo_disponivel: 0,
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    itens: [],
  });
  const [editing, setEditing] = useState(null);

  const ativosFornecedor = useMemo(
    () => fornecedores.filter((f) => f.status === "ativo"),
    [fornecedores]
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!form.numero_contrato || !form.fornecedor_nome) throw new Error("Número do contrato e fornecedor são obrigatórios.");
      const payload = {
        numero_contrato: form.numero_contrato,
        fornecedor_nome: form.fornecedor_nome,
        cnpj_fornecedor: onlyDigits(form.cnpj_fornecedor),
        descricao: form.descricao,
        valor_total: Number(form.valor_total) || 0,
        saldo_disponivel: Number(form.saldo_disponivel) || 0,
        status: form.status,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        itens_json: JSON.stringify(form.itens || []),
      };
      if (editing) return base44.entities.Contrato.update(editing.id, payload);
      return base44.entities.Contrato.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contratos"] });
      setEditing(null);
      setForm({
        numero_contrato: "",
        fornecedor_nome: "",
        cnpj_fornecedor: "",
        descricao: "",
        valor_total: 0,
        saldo_disponivel: 0,
        status: "ativo",
        data_inicio: "",
        data_fim: "",
        itens: [],
      });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-sm text-muted-foreground">Itens autorizados em JSON (via editor). Saldo é editável manualmente.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar contrato" : "Novo contrato"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fornecedor cadastrado</Label>
                <select
                  className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  value={form.cnpj_fornecedor}
                  onChange={(e) => {
                    const cnpj = e.target.value;
                    const f = ativosFornecedor.find((x) => onlyDigits(x.cnpj) === onlyDigits(cnpj));
                    setForm((prev) => ({
                      ...prev,
                      cnpj_fornecedor: cnpj,
                      fornecedor_nome: f?.razao_social || prev.fornecedor_nome,
                    }));
                  }}
                >
                  <option value="">Selecione…</option>
                  {ativosFornecedor.map((f) => (
                    <option key={f.id} value={f.cnpj}>
                      {f.razao_social}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Número do contrato *</Label>
                <Input value={form.numero_contrato} onChange={(e) => setForm({ ...form, numero_contrato: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Fornecedor (nome) *</Label>
                <Input value={form.fornecedor_nome} onChange={(e) => setForm({ ...form, fornecedor_nome: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ vinculado</Label>
                <Input value={form.cnpj_fornecedor} onChange={(e) => setForm({ ...form, cnpj_fornecedor: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ativo">ativo</option>
                  <option value="encerrado">encerrado</option>
                  <option value="suspenso">suspenso</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor total (R$)</Label>
                <Input type="number" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Saldo disponível (R$)</Label>
                <Input type="number" value={form.saldo_disponivel} onChange={(e) => setForm({ ...form, saldo_disponivel: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Início</Label>
                <Input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
              </div>
            </div>
            <ItensContratoEditor value={form.itens} onChange={(itens) => setForm({ ...form, itens })} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
                Salvar
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      numero_contrato: "",
                      fornecedor_nome: "",
                      cnpj_fornecedor: "",
                      descricao: "",
                      valor_total: 0,
                      saldo_disponivel: 0,
                      status: "ativo",
                      data_inicio: "",
                      data_fim: "",
                      itens: [],
                    });
                  }}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
            {save.error && <p className="text-sm text-red-600">{save.error.message}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contratos cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos.map((c) => (
                  <Fragment key={c.id}>
                    <TableRow>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}>
                          {expanded[c.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{c.numero_contrato}</TableCell>
                      <TableCell>{c.fornecedor_nome}</TableCell>
                      <TableCell>{formatCnpj(c.cnpj_fornecedor)}</TableCell>
                      <TableCell>R$ {Number(c.saldo_disponivel).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "ativo" ? "success" : "secondary"}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(c);
                            setForm({
                              ...c,
                              itens: parseItens(c.itens_json),
                            });
                          }}
                        >
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => base44.entities.Contrato.delete(c.id).then(() => qc.invalidateQueries({ queryKey: ["contratos"] }))}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expanded[c.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/40 text-sm">
                          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-3">{JSON.stringify(parseItens(c.itens_json), null, 2)}</pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
