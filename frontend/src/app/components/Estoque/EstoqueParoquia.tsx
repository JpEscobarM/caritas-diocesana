import { AlertCircle, Warehouse } from "lucide-react";

import { getAuthSession } from "../../api/auth";
import { Card, CardContent } from "../ui/card";
import EstoquePage from "./EstoquePage";

/**
 * Entrada do módulo de estoque no painel paroquial.
 *
 * A paróquia é obtida diretamente da sessão autenticada. Dessa forma, o
 * usuário paroquial não escolhe outro estoque e trabalha somente no escopo
 * autorizado pelo token.
 */
export default function EstoqueParoquia() {
  const session = getAuthSession();
  const parish = session?.parish ?? null;

  if (!session || !parish) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center">
          <Warehouse className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="font-semibold text-foreground">
              Paróquia não identificada
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Não foi possível identificar a paróquia vinculada à sessão atual.
              Entre novamente pelo acesso paroquial.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canAccessParish = session.abilities.includes(`parish:${parish.id}`);

  if (!canAccessParish) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="font-semibold text-foreground">
              Acesso ao estoque não autorizado
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Sua sessão não possui permissão para consultar ou gerenciar o
              estoque desta paróquia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <EstoquePage
      key={parish.id}
      modo="paroquia"
      parishId={parish.id}
      parishName={parish.name}
    />
  );
}
