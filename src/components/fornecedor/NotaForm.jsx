import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContratoSelector from "@/components/fornecedor/ContratoSelector.jsx";
import ItensNota from "@/components/fornecedor/ItensNota.jsx";
import ImpostosSummary from "@/components/fornecedor/ImpostosSummary.jsx";
import { TIPOS_SERVICO, labelTipoServico } from "@/lib/tributario";
import { base44, findContratoByNumero } from "@/api/base44Client.js";
import { enviarNotaFiscal } from "@/components/api/mockWebhook.js";
import { validarChaveAcesso, formatarChaveAcesso } from "@/lib/nfeValidation";
import { onlyDigits } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function NotaForm({ contratos, cnpjFornecedor, fornecedorNome, emailFornecedor, onSubmitted }) {
  const [numeroContrato, setNumeroContrato] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [tipoServico, setTipoServico] = useState("servicos_ti");
  const [items, setItems] = useState([{ codigo: "SRV-001", descricao: "Desenvolvimento de Software", quantidade: 10, valor_unitario: 150 }]);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const valorBruto = useMemo(
    () => items.reduce((a, it) => a + (Number(it.quantidade) || 0) * (Number(it.valor_unitario) || 0), 0),
    [items]
  );

  const chaveDigitos = chaveAcesso.replace(/\D/g, "");
  const chaveValidacao = chaveDigitos.length > 0 ? validarChaveAcesso(chaveDigitos) : null;

  function handleChaveChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 44);
    setChaveAcesso(raw);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!numeroContrato || !numeroNota) {
      setMsg("Preencha contrato e número da NF.");
      return;
    }
    if (!chaveAcesso || chaveDigitos.length !== 44) {
      setMsg("Informe a chave de acesso com 44 dígitos.");
      return;
    }
    if (chaveValidacao && !chaveValidacao.valida) {
      setMsg(`Chave de acesso inválida: ${chaveValidacao.motivo}`);
      return;
    }
    if (!items.length) {
      setMsg("Informe ao menos um item.");
      return;
    }
    if (!file) {
      setMsg("Anexe o arquivo XML ou PDF da nota.");
      return;
    }
    setBusy(true);
    try {
      const contrato = await findContratoByNumero(numeroContrato);
      if (!contrato) {
        setMsg("Contrato não encontrado.");
        setBusy(false);
        return;
      }
      const up = await base44.integrations.Core.UploadFile({ file, name: file.name });
      const payload = {
        cabecalho: {
          cnpj_emissor: onlyDigits(cnpjFornecedor),
          numero_nota: numeroNota,
          numero_contrato: numeroContrato,
          chave_acesso: chaveDigitos,
          arquivo_url: up.url,
        },
        items: items.map((it) => ({
          codigo: it.codigo,
          descricao: it.descricao,
          quantidade: Number(it.quantidade) || 0,
          valor_unitario: Number(it.valor_unitario) || 0,
          valor_total: (Number(it.quantidade) || 0) * (Number(it.valor_unitario) || 0),
        })),
        valor_bruto_total: valorBruto,
      };

      const res = await enviarNotaFiscal(payload, contrato);
      const baseNota = {
        cnpj_emissor: onlyDigits(cnpjFornecedor),
        numero_nota: numeroNota,
        numero_contrato: numeroContrato,
        chave_acesso: chaveDigitos,
        valor_bruto: valorBruto,
        items_json: JSON.stringify(items),
        arquivo_url: up.url,
        arquivo_nome: up.name || file.name,
        fornecedor_nome: fornecedorNome,
        email_fornecedor: emailFornecedor,
        tipo_servico: tipoServico,
      };

      if (!res.success) {
        await base44.entities.NotaFiscal.create({
          ...baseNota,
          status: "rejeitada",
          motivo_rejeicao: `[${res.tipo_rejeicao}] ${res.motivo}`,
        });
        setMsg(res.motivo || "Nota rejeitada pelo matching.");
        onSubmitted?.();
        return;
      }

      await base44.entities.NotaFiscal.create({
        ...baseNota,
        status: "pendente",
        motivo_rejeicao: "",
        protocolo: res.protocolo,
      });
      setMsg(`Nota enviada. Protocolo: ${res.protocolo}. Aguardando aprovação.`);
      onSubmitted?.();
      setNumeroNota("");
      setChaveAcesso("");
      setFile(null);
    } catch (err) {
      setMsg(err?.message || "Erro ao enviar nota.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Envio de nota fiscal</CardTitle>
          <CardDescription>Preencha os dados; o Two-Way Matching roda automaticamente ao enviar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContratoSelector contratos={contratos} value={numeroContrato} onChange={setNumeroContrato} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Número da NF</Label>
              <Input value={numeroNota} onChange={(e) => setNumeroNota(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de serviço (motor tributário)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                value={tipoServico}
                onChange={(e) => setTipoServico(e.target.value)}
              >
                {TIPOS_SERVICO.map((k) => (
                  <option key={k} value={k}>
                    {labelTipoServico(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chave de Acesso NF-e */}
          <div className="space-y-2">
            <Label>
              Chave de acesso NF-e{" "}
              <span className="text-muted-foreground font-normal">(44 dígitos)</span>
            </Label>
            <div className="relative">
              <Input
                value={formatarChaveAcesso(chaveAcesso)}
                onChange={handleChaveChange}
                placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                className={`font-mono pr-10 ${
                  chaveValidacao
                    ? chaveValidacao.valida
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                maxLength={54}
              />
              {chaveValidacao && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {chaveValidacao.valida ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
              )}
            </div>
            {chaveValidacao && !chaveValidacao.valida && (
              <p className="text-xs text-red-500">{chaveValidacao.motivo}</p>
            )}
            {chaveValidacao && chaveValidacao.valida && (
              <p className="text-xs text-green-600">Formato válido — situação será consultada ao enviar.</p>
            )}
            <p className="text-xs text-muted-foreground">
              A chave fica impressa no DANFE / XML da NF-e. Digite apenas os números.
            </p>
          </div>

          <ItensNota items={items} onChange={setItems} />
          <div className="space-y-2">
            <Label>Anexo (XML ou PDF)</Label>
            <Input type="file" accept=".xml,.pdf,application/pdf,text/xml" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ImpostosSummary valorBruto={valorBruto} tipoServico={tipoServico} />
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Valor bruto total</p>
              <p className="text-2xl font-bold">{valorBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submeter para validação
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
