// src/pages/CalendarioFiscal.jsx

import AppLayout from "@/components/layout/AppLayout.jsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const eventos = {
  "2026-06-10": ["Entrega SPED Fiscal"],
  "2026-06-15": ["Pagamento ICMS"],
  "2026-06-20": ["Entrega EFD-Contribuições"],
};

export default function CalendarioFiscal() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">
        Calendário Fiscal
      </h1>

      <Calendar />

      <div className="mt-6">
        <h2 className="font-semibold">
          Próximos vencimentos
        </h2>

        {Object.entries(eventos).map(([data, itens]) => (
          <div
            key={data}
            className="border rounded p-3 mt-2"
          >
            <strong>{data}</strong>
            <ul>
              {itens.map((evento) => (
                <li key={evento}>{evento}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}