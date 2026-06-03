import { Card, CardContent } from "@/components/ui/card";

export default function NotificationPanel({ notificacoes }) {
  return (
    <Card className="absolute right-0 top-12 w-96 z-50">
      <CardContent className="p-4">
        <h3 className="font-bold mb-4">Notificações</h3>

        <div className="space-y-3">
          {notificacoes.map(item => (
            <div key={item.id} className="border-b pb-2">
              <p>{item.mensagem}</p>
              <small className="text-gray-500">{item.data}</small>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
