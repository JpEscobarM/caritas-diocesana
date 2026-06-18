import { AlertTriangle, CalendarClock, PackageX } from "lucide-react";

import type {
  ExpiredParishInventoryItem,
  ExpiringParishInventoryItem,
  ParishInventoryItemQuantity,
} from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface AlertasValidadeProps {
  expiringItems: ExpiringParishInventoryItem[];
  expiredItems: ExpiredParishInventoryItem[];
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function LotsList({ lots }: { lots: ParishInventoryItemQuantity[] }) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {lots.map((lot) => (
        <div
          key={lot.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
        >
          <span className="font-medium text-foreground">{lot.quantity} unidade(s)</span>
          <span className="text-muted-foreground">{formatDate(lot.valid_until)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AlertasValidade({
  expiringItems,
  expiredItems,
}: AlertasValidadeProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-5 text-amber-600" aria-hidden="true" />
                Vencendo nos próximos 7 dias
              </CardTitle>
              <CardDescription>
                Lotes que precisam de atenção e prioridade na próxima entrega.
              </CardDescription>
            </div>
            <Badge variant="secondary">{expiringItems.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiringItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <AlertTriangle className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Nenhum lote vence nos próximos sete dias.
              </p>
            </div>
          ) : (
            expiringItems.map((item) => (
              <article key={item.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description || "Sem descrição"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {item.valid_until_quantity} unidade(s)
                  </Badge>
                </div>
                <LotsList lots={item.quantities} />
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PackageX className="size-5 text-destructive" aria-hidden="true" />
                Lotes vencidos
              </CardTitle>
              <CardDescription>
                Itens expirados identificados pela API no estoque selecionado.
              </CardDescription>
            </div>
            <Badge variant="destructive">{expiredItems.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiredItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <PackageX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Nenhum lote vencido encontrado.
              </p>
            </div>
          ) : (
            expiredItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-destructive/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description || "Sem descrição"}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {item.expired_quantity} unidade(s)
                  </Badge>
                </div>
                <LotsList lots={item.quantities} />
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
