import { Label } from "@/components/ui/label";

export default function ContratoSelector({ contratos, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <Label>Contrato</Label>
      <select
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione…</option>
        {contratos.map((c) => (
          <option key={c.id} value={c.numero_contrato}>
            {c.numero_contrato} — {c.descricao || "Sem descrição"} (saldo R$ {Number(c.saldo_disponivel).toFixed(2)})
          </option>
        ))}
      </select>
    </div>
  );
}
