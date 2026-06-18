import type {
  BasketTemplate,
  CreateBasketDeliveryPayload,
  ParishInventoryItem,
} from "../../types/EstoqueTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface RegistrarEntregaModalProps {
  parishId: number;
  templates: BasketTemplate[];
  inventoryItems: ParishInventoryItem[];
  onSubmit: (payload: CreateBasketDeliveryPayload) => Promise<void> | void;
}

/**
 * Estrutura reservada para a etapa de entregas.
 * A saída de estoque deve ocorrer exclusivamente por este fluxo.
 */
export default function RegistrarEntregaModal({
  parishId,
  templates,
  inventoryItems,
}: RegistrarEntregaModalProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar entrega de cesta</CardTitle>
        <CardDescription>
          Base preparada para selecionar família, modelo de cesta e lotes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Paróquia: {parishId}</p>
        <p>Modelos disponíveis: {templates.length}</p>
        <p>Itens disponíveis: {inventoryItems.length}</p>
        <p>
          Esta será a única operação de saída de estoque disponibilizada no
          frontend.
        </p>
      </CardContent>
    </Card>
  );
}
