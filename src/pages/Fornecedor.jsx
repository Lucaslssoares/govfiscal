import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44, listContratosAtivosForCnpj } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import NotaForm from "@/components/fornecedor/NotaForm.jsx";
import HistoricoNotas from "@/components/fornecedor/HistoricoNotas.jsx";
import { useAuth } from "@/lib/AuthContext.jsx";
import { onlyDigits } from "@/lib/utils";
import { useMemo } from "react";

export default function Fornecedor() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const cnpj = onlyDigits(user?.cnpj || "");
  const nome = user?.razao_social || user?.nome || "Fornecedor";
  const email = user?.email || "";

  const { data: contratos = [] } = useQuery({
    queryKey: ["contratos-forn", cnpj],
    queryFn: () => listContratosAtivosForCnpj(cnpj),
    enabled: !!cnpj,
  });

  const { data: notas = [] } = useQuery({
    queryKey: ["notas"],
    queryFn: () => base44.entities.NotaFiscal.filter({}),
  });

  const minhasNotas = useMemo(() => notas.filter((n) => onlyDigits(n.cnpj_emissor) === cnpj), [notas, cnpj]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Portal do fornecedor</h1>
          <p className="text-sm text-muted-foreground">Visão isolada por CNPJ (RN-01). Contratos inativos/encerrados não aparecem.</p>
        </div>
        {!cnpj && <p className="text-sm text-red-700">Sessão sem CNPJ — faça login como fornecedor na tela de Acesso.</p>}
        {cnpj && (
          <>
            <NotaForm
              contratos={contratos}
              cnpjFornecedor={cnpj}
              fornecedorNome={nome}
              emailFornecedor={email}
              onSubmitted={() => qc.invalidateQueries({ queryKey: ["notas"] })}
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">Histórico</h2>
              <HistoricoNotas notas={minhasNotas} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
