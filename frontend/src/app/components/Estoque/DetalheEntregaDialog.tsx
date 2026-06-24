import { CalendarDays, Gift, Package, UserRound } from "lucide-react";

import type { BasketDelivery } from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export interface DetalheEntregaDialogProps {
  open: boolean;
  delivery: BasketDelivery | null;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsed);
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export default function DetalheEntregaDialog({
  open,
  delivery,
  onOpenChange,
}: DetalheEntregaDialogProps) {
  const totalUnits =
    delivery?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5" aria-hidden="true" />
            Detalhes da entrega
          </DialogTitle>
          <DialogDescription>
            Consulte a família, os itens e os lotes efetivamente baixados.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Família</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                  <UserRound className="size-4" aria-hidden="true" />
                  {delivery.family_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Identificador #{delivery.family_id}
                </p>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Data da entrega</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {formatDateTime(delivery.delivered_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Entrega #{delivery.id}
                </p>
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de cesta</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {delivery.basket_template_name || "Cesta montada na hora"}
                  </p>
                </div>
                <Badge
                  variant={
                    delivery.basket_template_id !== null
                      ? "secondary"
                      : "outline"
                  }
                >
                  {delivery.basket_template_id !== null
                    ? `Modelo #${delivery.basket_template_id}`
                    : "Personalizada"}
                </Badge>
              </div>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Itens entregues
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {delivery.items.length} item(ns), {totalUnits} unidade(s)
                  </p>
                </div>
                <Package
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-2">
                {delivery.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Item #{item.parish_inventory_item_id} · Lote #
                        {item.parish_inventory_item_quantity_id}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">{item.quantity} un.</Badge>
                      <Badge variant="outline">
                        Validade: {formatDate(item.valid_until)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Observações
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {delivery.notes || "Nenhuma observação registrada."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
