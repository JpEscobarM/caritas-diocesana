import { useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Gift,
  History,
  Package,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import type { BasketDelivery } from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface EntregasCestaListProps {
  deliveries: BasketDelivery[];
  onCreate?: () => void;
  onViewDetails?: (delivery: BasketDelivery) => void;
  onViewFamilyHistory?: (delivery: BasketDelivery) => void;
  actionsDisabled?: boolean;
}

type DeliveryTypeFilter = "all" | "template" | "custom";

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

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export default function EntregasCestaList({
  deliveries,
  onCreate,
  onViewDetails,
  onViewFamilyHistory,
  actionsDisabled = false,
}: EntregasCestaListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeliveryTypeFilter>("all");

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
  }, [deliveries, search, typeFilter]);

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Entregas para famílias</CardTitle>
            <CardDescription>
              Registre e consulte as saídas de estoque realizadas por entrega de
              cestas.
            </CardDescription>
          </div>

          {onCreate && (
            <Button
              type="button"
              onClick={onCreate}
              disabled={actionsDisabled}
            >
              <Plus aria-hidden="true" />
              Nova entrega
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar família, modelo, observação ou item"
              className="pl-9"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as DeliveryTypeFilter)
            }
          >
            <SelectTrigger aria-label="Filtrar entregas por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as entregas</SelectItem>
              <SelectItem value="template">Com modelo</SelectItem>
              <SelectItem value="custom">Montadas na hora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {deliveries.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Gift className="size-10 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                Nenhuma entrega registrada
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Registre a primeira entrega para uma família. A confirmação fará
                a baixa dos itens no estoque.
              </p>
            </div>
            {onCreate && (
              <Button
                type="button"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Registrar primeira entrega
              </Button>
            )}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Search className="size-9 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                Nenhuma entrega encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                Altere a busca ou o filtro para visualizar outros registros.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredDeliveries.length} entrega(s) encontrada(s)</span>
              <Badge variant="secondary">Total: {deliveries.length}</Badge>
            </div>

            {filteredDeliveries.map((delivery) => {
              const totalUnits = delivery.items.reduce(
                (total, item) => total + item.quantity,
                0,
              );

              return (
                <article
                  key={delivery.id}
                  className="rounded-xl border p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {delivery.family_name}
                        </h3>
                        <Badge variant="outline">Entrega #{delivery.id}</Badge>
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

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {formatDateTime(delivery.delivered_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Package className="size-4" aria-hidden="true" />
                          {delivery.items.length} item(ns), {totalUnits} unidade(s)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="size-4" aria-hidden="true" />
                          Família #{delivery.family_id}
                        </span>
                      </div>

                      {delivery.notes && (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {delivery.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      {onViewDetails && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onViewDetails(delivery)}
                        >
                          <Eye aria-hidden="true" />
                          Ver detalhes
                        </Button>
                      )}

                      {onViewFamilyHistory && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onViewFamilyHistory(delivery)}
                        >
                          <History aria-hidden="true" />
                          Histórico da família
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
