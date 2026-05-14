import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function UserNotRegisteredError() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Acesso necessário</CardTitle>
        <CardDescription>Selecione um perfil na tela de acesso para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link to="/acesso">Ir para Acesso</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
