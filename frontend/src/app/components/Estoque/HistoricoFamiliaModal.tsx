import type { BasketDelivery } from "../../types/EstoqueTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface HistoricoFamiliaModalProps {
  familyId: number | null;
  familyName?: string | null;
  deliveries: BasketDelivery[];
}

/** Estrutura base para o histórico de cestas recebidas por uma família. */
export default function HistoricoFamiliaModal({
  familyId,
  familyName,
  deliveries,
}: HistoricoFamiliaModalProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico da família</CardTitle>
        <CardDescription>
          {familyId
            ? `${familyName ?? "Família selecionada"} recebeu ${deliveries.length} cesta(s).`
            : "Selecione uma família para consultar seu histórico."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        O detalhamento completo será conectado ao endpoint de histórico por família
        na etapa de entregas.
      </CardContent>
    </Card>
  );
}
