import { useMemo, useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import { useAuth } from "@/lib/AuthContext.jsx";
import { onlyDigits } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CentralDisputas() {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const cnpj = onlyDigits(user?.cnpj || "");
  const bottomRef = useRef(null);

  const { data: notas = [] } = useQuery({ queryKey: ["notas"], queryFn: () => base44.entities.NotaFiscal.filter({}), refetchInterval: 10_000 });
  const { data: disputas = [] } = useQuery({ queryKey: ["disputas"], queryFn: () => base44.entities.Disputa.filter({}), refetchInterval: 10_000 });

  const eligible = useMemo(() => {
    const idsComDisputa = new Set(disputas.map((d) => d.nota_fiscal_id));
    return notas.filter((n) => {
      if (role === "fornecedor" && onlyDigits(n.cnpj_emissor) !== cnpj) return false;
      if (role === "fornecedor" && n.status !== "rejeitada" && !idsComDisputa.has(n.id)) return false;
      return n.status === "rejeitada" || idsComDisputa.has(n.id);
    });
  }, [notas, disputas, role, cnpj]);

  const [activeId, setActiveId] = useState("");
  const activeNota = eligible.find((n) => n.id === activeId) || null;
  const thread = useMemo(
    () => disputas.filter((d) => d.nota_fiscal_id === activeId).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [disputas, activeId]
  );

  useEffect(() => {
    if (!activeId && eligible[0]) setActiveId(eligible[0].id);
  }, [eligible, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, activeId]);

  const [texto, setTexto] = useState("");
  const [file, setFile] = useState(null);

  const send = useMutation({
    mutationFn: async () => {
      if (!activeNota || !texto.trim()) return;
      let arquivo_url = "";
      let arquivo_nome = "";
      if (file) {
        const up = await base44.integrations.Core.UploadFile({ file, name: file.name });
        arquivo_url = up.url;
        arquivo_nome = up.name;
      }
      const papel = role === "fornecedor" ? "fornecedor" : "gestor";
      const autor = user?.nome || user?.razao_social || "Usuário";
      await base44.entities.Disputa.create({
        nota_fiscal_id: activeNota.id,
        numero_nota: activeNota.numero_nota,
        fornecedor_nome: activeNota.fornecedor_nome,
        autor,
        papel,
        mensagem: texto.trim(),
        arquivo_url,
        arquivo_nome,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disputas"] });
      setTexto("");
      setFile(null);
    },
  });

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Notas elegíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {eligible.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma nota na central.</p>}
            {eligible.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveId(n.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  n.id === activeId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">NF {n.numero_nota}</span>
                  <Badge variant={n.status === "rejeitada" ? "danger" : "secondary"}>{n.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{n.fornecedor_nome}</p>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thread auditável</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[520px] flex-col gap-3">
            {!activeNota && <p className="text-sm text-muted-foreground">Selecione uma nota.</p>}
            {activeNota && (
              <>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
                  {thread.map((m) => (
                    <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${m.papel === "fornecedor" ? "ml-auto bg-emerald-50" : "mr-auto bg-card"}`}>
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{m.autor}</span>
                        <Badge variant="outline">{m.papel}</Badge>
                        <span>
                          {m.created_date ? format(parseISO(m.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : ""}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.mensagem}</p>
                      {m.arquivo_url && (
                        <a className="mt-1 block text-xs text-primary underline" href={m.arquivo_url} target="_blank" rel="noreferrer">
                          {m.arquivo_nome || "Anexo"}
                        </a>
                      )}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        send.mutate();
                      }
                    }}
                    placeholder="Escreva uma mensagem… (Ctrl+Enter para enviar)"
                    rows={3}
                  />
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <Button onClick={() => send.mutate()} disabled={send.isPending || !texto.trim()}>
                    Enviar
                  </Button>
                  <p className="text-xs text-muted-foreground">Mensagens não são editadas nem apagadas (RN-03).</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
