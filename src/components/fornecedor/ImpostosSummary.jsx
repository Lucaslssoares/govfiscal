import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularImpostos, labelTipoServico } from "@/lib/tributario";
import { formatBRL } from "@/lib/utils";

export default function ImpostosSummary({ valorBruto, tipoServico }) {
  const r = calcularImpostos(valorBruto, tipoServico);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retenções estimadas</CardTitle>
        <p className="text-sm text-muted-foreground">{labelTipoServico(tipoServico)}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {r.retencoes.map((x) => (
          <div key={x.imposto} className="flex justify-between border-b border-dashed border-border py-1">
            <span>
              {x.imposto}{" "}
              <span className="text-muted-foreground">({(x.aliquota * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)</span>
            </span>
            <span>{formatBRL(x.valor)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold">
          <span>Total retenções</span>
          <span>{formatBRL(r.totalRetencoes)}</span>
        </div>
        <div className="flex justify-between font-semibold text-emerald-800">
          <span>Valor líquido estimado</span>
          <span>{formatBRL(r.valorLiquido)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
