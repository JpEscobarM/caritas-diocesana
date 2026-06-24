import { useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Gift,
  History,
  Loader2,
  Package,
  Search,
  UserRound,
} from "lucide-react";

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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface HistoricoFamiliaModalProps {
  open: boolean;
  familyId: number | null;
  familyName: string | null;
  deliveries: BasketDelivery[];
  loading?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
  onViewDelivery?: (delivery: BasketDelivery) => void;
}

type HistoryTypeFilter = "all" | "template" | "custom";

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function getDeliveryDay(deliveredAt: string): string {
  if (deliveredAt.includes("T")) {
    return deliveredAt.split("T")[0];
  }

  return deliveredAt.split(" ")[0] ?? deliveredAt;
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function formatLongDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsed);
}

export default function HistoricoFamiliaModal({
  open,
  familyId,
  familyName,
  deliveries,
  loading = false,
  error = null,
  onOpenChange,
  onRetry,
  onViewDelivery,
}: HistoricoFamiliaModalProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredDeliveries = useMemo(() => {
    const normalized = normalizeSearch(search);

    return [...deliveries]
      .filter((delivery) => {
        if (typeFilter === "template") {
          return delivery.basket_template_id !== null;
        }

        if (typeFilter === "custom") {
          return delivery.basket_template_id === null;
        }

        return true;
      })
      .filter((delivery) => {
        const deliveryDay = getDeliveryDay(delivery.delivered_at);

        if (startDate && deliveryDay < startDate) {
          return false;
        }

        if (endDate && deliveryDay > endDate) {
          return false;
        }

        return true;
      })
      .filter((delivery) => {
        if (!normalized) {
          return true;
        }

        return [
          delivery.family_name,
          delivery.basket_template_name ?? "cesta montada na hora",
          delivery.notes ?? "",
          ...delivery.items.map((item) => item.name),
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      })
      .sort(
        (first, second) =>
          new Date(second.delivered_at).getTime() -
          new Date(first.delivered_at).getTime(),
      );
  }, [deliveries, endDate, search, startDate, typeFilter]);

  const totalUnits = filteredDeliveries.reduce(
    (total, delivery) =>
      total +
      delivery.items.reduce(
        (deliveryTotal, item) => deliveryTotal + item.quantity,
        0,
      ),
    0,
  );

  const totalDifferentItems = filteredDeliveries.reduce(
    (total, delivery) => total + delivery.items.length,
    0,
  );

  const lastDelivery = useMemo(
    () =>
      deliveries.length > 0
        ? [...deliveries].sort(
            (first, second) =>
              new Date(second.delivered_at).getTime() -
              new Date(first.delivered_at).getTime(),
          )[0]
        : null,
    [deliveries],
  );

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" aria-hidden="true" />
            Histórico da família
          </DialogTitle>
          <DialogDescription>
            Consulte as cestas já entregues e os lotes baixados para esta
            família.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border p-3 md:col-span-2">
              <p className="text-xs text-muted-foreground">Família</p>
              <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                <UserRound className="size-4" aria-hidden="true" />
                {familyName ?? "Família selecionada"}
              </p>
              {familyId !== null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Identificador #{familyId}
                </p>
              )}
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">Entregas</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {filteredDeliveries.length}
              </p>
              <p className="text-xs text-muted-foreground">
                de {deliveries.length} no histórico
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">
                Unidades entregues
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalUnits}
              </p>
              <p className="text-xs text-muted-foreground">
                em {totalDifferentItems} item(ns)
              </p>
            </div>
          </section>

          <section className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Última entrega</p>
            <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {lastDelivery
                ? formatLongDateTime(lastDelivery.delivered_at)
                : loading
                  ? "Carregando histórico..."
                  : "Nenhuma entrega registrada"}
            </p>
          </section>

          <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_13rem]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por modelo, item ou observação"
                className="pl-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="history-start-date" className="sr-only">
                Data inicial
              </Label>
              <Input
                id="history-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                aria-label="Data inicial"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="history-end-date" className="sr-only">
                Data final
              </Label>
              <Input
                id="history-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                aria-label="Data final"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as HistoryTypeFilter)
              }
            >
              <SelectTrigger aria-label="Filtrar histórico por tipo de cesta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="template">Com modelo</SelectItem>
                <SelectItem value="custom">Montadas na hora</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>
              {onRetry && (
                <Button type="button" variant="outline" onClick={onRetry}>
                  Tentar novamente
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <Loader2
                className="size-9 animate-spin text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-foreground">
                  Carregando histórico
                </p>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto buscamos as cestas já entregues.
                </p>
              </div>
            </div>
          ) : deliveries.length === 0 && !error ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <Gift
                className="size-9 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-foreground">
                  Nenhuma entrega para esta família
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Quando uma cesta for entregue para esta família, ela aparecerá
                  neste histórico.
                </p>
              </div>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <Search
                className="size-9 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-foreground">
                  Nenhum registro encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Altere a busca, o período ou o tipo de cesta.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <section className="space-y-3">
              {filteredDeliveries.map((delivery) => {
                const deliveryTotalUnits = delivery.items.reduce(
                  (total, item) => total + item.quantity,
                  0,
                );

                return (
                  <article key={delivery.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            Entrega #{delivery.id}
                          </h3>
                          <Badge
                            variant={
                              delivery.basket_template_id !== null
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {delivery.basket_template_id !== null
                              ? "Modelo"
                              : "Personalizada"}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {delivery.basket_template_name ||
                            "Cesta montada na hora"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="size-4"
                              aria-hidden="true"
                            />
                            {formatDateTime(delivery.delivered_at)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Package className="size-4" aria-hidden="true" />
                            {delivery.items.length} item(ns),{" "}
                            {deliveryTotalUnits} unidade(s)
                          </span>
                        </div>

                        {delivery.notes && (
                          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                            {delivery.notes}
                          </p>
                        )}
                      </div>

                      {onViewDelivery && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onViewDelivery(delivery)}
                        >
                          <Eye aria-hidden="true" />
                          Ver detalhes
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {delivery.items.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border p-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground">
                              {item.name}
                            </span>
                            <Badge variant="secondary">
                              {item.quantity} un.
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Lote #{item.parish_inventory_item_quantity_id} ·
                            validade {item.valid_until}
                          </p>
                        </div>
                      ))}
                    </div>

                    {delivery.items.length > 6 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        + {delivery.items.length - 6} item(ns) no detalhe da
                        entrega.
                      </p>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
