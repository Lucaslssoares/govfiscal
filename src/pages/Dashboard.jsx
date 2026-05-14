import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client.js";
import AppLayout from "@/components/layout/AppLayout.jsx";
import KpiCards from "@/components/dashboard/KpiCards.jsx";
import VolumeChart from "@/components/dashboard/VolumeChart.jsx";
import AuditoriaTable from "@/components/dashboard/AuditoriaTable.jsx";
import FilaAprovacao from "@/components/dashboard/FilaAprovacao.jsx";
import { useAuth } from "@/lib/AuthContext.jsx";

export default function Dashboard() {
  const qc = useQueryClient();
  const { role } = useAuth();
  const canApprove = role === "admin" || role === "gestor";
  const { data: notas = [] } = useQuery({ queryKey: ["notas"], queryFn: () => base44.entities.NotaFiscal.filter({}) });
  const { data: alcadas = [] } = useQuery({ queryKey: ["alcadas"], queryFn: () => base44.entities.Alcada.filter({}) });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">KPIs, fila de aprovação, volume e auditoria.</p>
        </div>
        <KpiCards notas={notas} />
        <div className="grid gap-6 lg:grid-cols-2">
          <FilaAprovacao notas={notas} alcadas={alcadas} canApprove={canApprove} onRefresh={() => qc.invalidateQueries({ queryKey: ["notas"] })} />
          <VolumeChart notas={notas} />
        </div>
        <AuditoriaTable notas={notas} />
      </div>
    </AppLayout>
  );
}
