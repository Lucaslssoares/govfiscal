import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/components/auth/authSimulator";

const perfisConvite = [
  { value: "gestor", label: "Gestor Financeiro" },
  { value: "analista", label: "Analista Financeiro" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "admin", label: "Administrador" },
];

function UserRoleEditor({ user, onSaved }) {
  const [r, setR] = useState(user.role);
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <select className="h-9 rounded-md border border-border bg-white px-2 text-sm" value={r} onChange={(e) => setR(e.target.value)}>
        {["admin", "gestor", "analista", "fornecedor"].map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={r === user.role}
        onClick={() => base44.entities.AppUser.update(user.id, { role: r }).then(onSaved)}
      >
        Salvar perfil
      </Button>
    </div>
  );
}

export default function GestaoUsuarios() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["appusers"], queryFn: () => base44.entities.AppUser.filter({}) });
  const [q, setQ] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("gestor");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => `${u.nome} ${u.email}`.toLowerCase().includes(s));
  }, [users, q]);

  const kpi = useMemo(() => {
    const m = { admin: 0, gestor: 0, analista: 0, fornecedor: 0, outro: 0 };
    users.forEach((u) => {
      if (m[u.role] !== undefined) m[u.role] += 1;
      else m.outro += 1;
    });
    return m;
  }, [users]);

  const invite = useMutation({
    mutationFn: async () => {
      if (!nome.trim() || !email.trim()) throw new Error("Nome e e-mail são obrigatórios.");
      const perfilLabel = perfisConvite.find((p) => p.value === perfil)?.label || perfil;
      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: "Você foi convidado para o Portal GovFiscal",
        body: `Olá, ${nome.trim()}!\nVocê foi convidado para acessar o Portal de Governança GovFiscal\ncom o perfil de ${perfilLabel}.\n\nAcesse o portal e utilize este e-mail para fazer login.\n\nEquipe GovFiscal`,
      });
      await base44.users.inviteUser(email.trim(), perfil);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appusers"] });
      setNome("");
      setEmail("");
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de usuários</h1>
          <p className="text-sm text-muted-foreground">Convites simulados (console + persistência local de usuários do app).</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(kpi).map(([k, v]) => (
            <Card key={k}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize text-muted-foreground">{k}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{v}</CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Matriz de permissões (resumo)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto text-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Módulo</th>
                  <th className="p-2">Admin</th>
                  <th className="p-2">Gestor</th>
                  <th className="p-2">Analista</th>
                  <th className="p-2">Fornecedor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Portal NF", "—", "—", "—", "✅"],
                  ["Dashboard", "✅", "✅", "—", "—"],
                  ["Fornecedores/Contratos/Alçadas/Fechamento", "✅", "✅", "—", "—"],
                  ["Disputas", "✅", "✅", "✅", "✅"],
                  ["Usuários", "✅", "—", "—", "—"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b">
                    {row.map((c) => (
                      <td key={c} className="p-2">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convidar usuário</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Perfil</Label>
              <select className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                {perfisConvite.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <Button className="md:col-span-2" onClick={() => invite.mutate()} disabled={invite.isPending}>
              Enviar convite
            </Button>
            {invite.error && <p className="text-sm text-red-600 md:col-span-2">{invite.error.message}</p>}
            {invite.isSuccess && <p className="text-sm text-emerald-700 md:col-span-2">Convite registrado (verifique o console para o e-mail simulado).</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Usuários</CardTitle>
            <Input className="max-w-xs" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLES[u.role]?.label || u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.status}</TableCell>
                    <TableCell className="text-right">
                      <UserRoleEditor key={`${u.id}-${u.role}`} user={u} onSaved={() => qc.invalidateQueries({ queryKey: ["appusers"] })} />
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
