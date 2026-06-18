import { CalendarDays, Gift, Package } from "lucide-react";

import type { BasketDelivery } from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface EntregasCestaListProps {
  deliveries: BasketDelivery[];
  onViewDetails?: (delivery: BasketDelivery) => void;
}

function formatDateTime(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function EntregasCestaList({
  deliveries,
  onViewDetails,
}: EntregasCestaListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Entregas de cesta</CardTitle>
            <CardDescription>
              Histórico das saídas de estoque realizadas para famílias.
            </CardDescription>
          </div>
          <Badge variant="secondary">{deliveries.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Gift className="size-9 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Nenhuma entrega registrada</p>
              <p className="text-sm text-muted-foreground">
                As saídas por entrega para famílias aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <button
                key={delivery.id}
                type="button"
                onClick={() => onViewDetails?.(delivery)}
                disabled={!onViewDetails}
                className="w-full rounded-xl border p-4 text-left transition-colors enabled:hover:border-primary/50 enabled:hover:bg-accent/50 disabled:cursor-default focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {delivery.family_name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {delivery.basket_template_name || "Cesta montada na hora"}
                    </p>
                  </div>
                  <Badge variant="outline">Entrega #{delivery.id}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatDateTime(delivery.delivered_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="size-4" aria-hidden="true" />
                    {delivery.items.length} item(ns)
                  </span>
                </div>

                {delivery.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {delivery.notes}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
