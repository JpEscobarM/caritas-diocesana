import type {
  BasketTemplate,
  BasketTemplatePayloadItem,
  ParishInventoryItem,
} from "../../types/EstoqueTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface ModeloCestaFormValues {
  name: string;
  description: string | null;
  active: boolean;
  items: BasketTemplatePayloadItem[];
}

export interface ModeloCestaFormProps {
  parishId: number;
  inventoryItems: ParishInventoryItem[];
  template?: BasketTemplate | null;
  onSubmit: (values: ModeloCestaFormValues) => Promise<void> | void;
}

/**
 * Estrutura reservada para a etapa de modelos de cesta.
 * A implementação do formulário completo será conectada às operações de CRUD
 * quando essa etapa do plano for iniciada.
 */
export default function ModeloCestaForm({
  parishId,
  inventoryItems,
  template = null,
}: ModeloCestaFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {template ? "Editar modelo de cesta" : "Novo modelo de cesta"}
        </CardTitle>
        <CardDescription>
          Estrutura preparada para selecionar itens e definir a quantidade de cada
          produto por cesta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Paróquia: {parishId}</p>
        <p>Itens disponíveis para composição: {inventoryItems.length}</p>
        <p>
          O formulário completo será implementado na etapa específica de modelos
          de cesta.
        </p>
      </CardContent>
    </Card>
  );
}
