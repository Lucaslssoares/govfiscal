import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/utils";

export default function VolumeChart({ notas }) {
  const data = useMemo(() => {
    const map = new Map();
    for (const n of notas) {
      const d = n.updated_date || n.created_date;
      if (!d) continue;
      const key = format(startOfMonth(parseISO(d)), "yyyy-MM");
      const cur = map.get(key) || { period: key, valor: 0 };
      cur.valor += Number(n.valor_bruto) || 0;
      map.set(key, cur);
    }
    const arr = [...map.values()]
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((x) => ({
        ...x,
        label: format(parseISO(`${x.period}-01`), "MMM/yy", { locale: ptBR }),
      }));
    return arr;
  }, [notas]);

  return (
    <div className="h-72 w-full rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-sm font-medium">Volume financeiro por período</p>
      {data.length === 0 ? (
        <p className="flex h-[80%] items-center justify-center text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => formatBRL(v)} />
            <Bar dataKey="valor" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
