import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

const emptyItem = () => ({
  codigo: "",
  descricao: "",
  unidade: "hora",
  valor_unitario: 0,
  quantidade_maxima: 0,
});

export default function ItensContratoEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];

  function update(idx, patch) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  }

  function add() {
    onChange([...items, emptyItem()]);
  }

  function remove(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Itens autorizados</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="mr-1 h-4 w-4" />
          Item
        </Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item cadastrado.</p>}
      <div className="space-y-3">
        {items.map((it, idx) => (
          <Card key={idx}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <Label>Código</Label>
                <Input value={it.codigo} onChange={(e) => update(idx, { codigo: e.target.value })} placeholder="SRV-001" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={it.descricao} onChange={(e) => update(idx, { descricao: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Unidade</Label>
                <Input value={it.unidade} onChange={(e) => update(idx, { unidade: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Valor unit. (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={it.valor_unitario}
                  onChange={(e) => update(idx, { valor_unitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label>Qtd. máxima</Label>
                <Input
                  type="number"
                  value={it.quantidade_maxima}
                  onChange={(e) => update(idx, { quantidade_maxima: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div className="flex items-end justify-end sm:col-span-2 lg:col-span-5">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remover item">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
