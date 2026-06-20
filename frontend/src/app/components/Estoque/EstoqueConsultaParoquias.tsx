import { AlertCircle, Building2 } from "lucide-react";

import { getAuthSession } from "../../api/auth";
import { Card, CardContent } from "../ui/card";
import EstoquePage from "./EstoquePage";

/**
 * Consulta paroquial dos estoques de outras paróquias.
 *
 * A tela usa o token da própria paróquia, mas permite selecionar qualquer
 * paróquia para listar os itens liberados pelo backend.
 */
export default function EstoqueConsultaParoquias() {
  const session = getAuthSession();
  const parish = session?.parish ?? null;

  if (!session || !parish) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center">
          <Building2
            className="size-10 text-muted-foreground"
            aria-hidden="true"
          />
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
              Acesso à consulta não autorizado
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Sua sessão não possui permissão para consultar estoques de
              paróquias.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <EstoquePage
      key={`consulta-paroquias-${parish.id}`}
      modo="paroquia"
      parishId={parish.id}
      parishName={parish.name}
      readOnlyParishLookup
    />
  );
}
