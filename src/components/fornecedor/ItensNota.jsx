import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const empty = () => ({ codigo: "", descricao: "", quantidade: 1, valor_unitario: 0 });

export default function ItensNota({ items, onChange }) {
  const list = Array.isArray(items) ? items : [];

  function set(idx, patch) {
    onChange(list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Itens da nota</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...list, empty()])}>
          <Plus className="mr-1 h-4 w-4" />
          Item
        </Button>
      </div>
      {list.map((it, idx) => {
        const total = (Number(it.quantidade) || 0) * (Number(it.valor_unitario) || 0);
        return (
          <Card key={idx}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1">
                <Label>Código</Label>
                <Input value={it.codigo} onChange={(e) => set(idx, { codigo: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={it.descricao} onChange={(e) => set(idx, { descricao: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Qtd.</Label>
                <Input type="number" value={it.quantidade} onChange={(e) => set(idx, { quantidade: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label>V. unit. (R$)</Label>
                <Input type="number" step="0.01" value={it.valor_unitario} onChange={(e) => set(idx, { valor_unitario: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label>Total linha</Label>
                <Input readOnly value={total.toFixed(2)} />
              </div>
              <div className="flex items-end justify-end sm:col-span-2 lg:col-span-6">
                <Button type="button" variant="ghost" size="icon" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
