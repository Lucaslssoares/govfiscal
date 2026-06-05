import AppLayout from "@/components/layout/AppLayout.jsx";

export default function FAQ() {
  const perguntas = [
    {
      pergunta: "Como cadastrar uma nota fiscal?",
      resposta: "Acesse o módulo correspondente e preencha os dados obrigatórios."
    },
    {
      pergunta: "Como consultar o calendário fiscal?",
      resposta: "Utilize o menu Calendário Fiscal disponível na barra lateral."
    },
    {
      pergunta: "Quem pode aprovar documentos?",
      resposta: "Somente usuários com perfil Gestor ou Administrador."
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Perguntas Frequentes (FAQ)
        </h1>

        {perguntas.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border p-4"
          >
            <h2 className="font-semibold">
              {item.pergunta}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {item.resposta}
            </p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}