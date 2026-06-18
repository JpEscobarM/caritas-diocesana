import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  PackageSearch,
  PackageX,
  RotateCcw,
  Search,
  Warehouse,
} from "lucide-react";

import type {
  ExpiredParishInventoryItem,
  ExpiringParishInventoryItem,
  ParishInventory,
  ParishInventoryItemQuantity,
} from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface AlertasValidadeProps {
  inventories: ParishInventory[];
  expiringItems: ExpiringParishInventoryItem[];
  expiredItems: ExpiredParishInventoryItem[];
  onOpenInventory?: (inventoryId: number) => void;
}

type ValidityStatus = "all" | "expiring" | "expired";

type AlertItem =
  | {
      key: string;
      status: "expiring";
      item: ExpiringParishInventoryItem;
      alertQuantity: number;
    }
  | {
      key: string;
      status: "expired";
      item: ExpiredParishInventoryItem;
      alertQuantity: number;
    };

const DAY_IN_MILLISECONDS = 86_400_000;

function parseIsoDateToUtc(date: string): number | null {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day);
}

function getTodayUtc(): number {
  const today = new Date();

  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
}

function getDaysFromToday(date: string): number | null {
  const parsedDate = parseIsoDateToUtc(date);

  if (parsedDate === null) {
    return null;
  }

  return Math.round((parsedDate - getTodayUtc()) / DAY_IN_MILLISECONDS);
}

function formatDate(date: string): string {
  const parsedDate = parseIsoDateToUtc(date);

  if (parsedDate === null) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(parsedDate),
  );
}

function formatRelativeDate(date: string): string {
  const days = getDaysFromToday(date);

  if (days === null) {
    return "Data inválida";
  }

  if (days === 0) {
    return "Vence hoje";
  }

  if (days === 1) {
    return "Vence amanhã";
  }

  if (days > 1) {
    return `Vence em ${days} dias`;
  }

  if (days === -1) {
    return "Vencido há 1 dia";
  }

  return `Vencido há ${Math.abs(days)} dias`;
}

function getFirstValidityDate(
  quantities: ParishInventoryItemQuantity[],
): string {
  return [...quantities]
    .sort((first, second) =>
      first.valid_until.localeCompare(second.valid_until),
    )[0]?.valid_until ?? "9999-12-31";
}

function sortLots(
  quantities: ParishInventoryItemQuantity[],
): ParishInventoryItemQuantity[] {
  return [...quantities].sort((first, second) =>
    first.valid_until.localeCompare(second.valid_until),
  );
}

function pluralizeLots(value: number): string {
  return value === 1 ? "lote" : "lotes";
}

export default function AlertasValidade({
  inventories,
  expiringItems,
  expiredItems,
  onOpenInventory,
}: AlertasValidadeProps) {
  const [status, setStatus] = useState<ValidityStatus>("all");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const inventoryNames = useMemo(
    () =>
      new Map(
        inventories.map((inventory) => [inventory.id, inventory.name] as const),
      ),
    [inventories],
  );

  const expiringQuantity = useMemo(
    () =>
      expiringItems.reduce(
        (total, item) => total + item.valid_until_quantity,
        0,
      ),
    [expiringItems],
  );

  const expiredQuantity = useMemo(
    () =>
      expiredItems.reduce(
        (total, item) => total + item.expired_quantity,
        0,
      ),
    [expiredItems],
  );

  const totalAlertLots = useMemo(
    () =>
      expiringItems.reduce(
        (total, item) => total + item.quantities.length,
        0,
      ) +
      expiredItems.reduce(
        (total, item) => total + item.quantities.length,
        0,
      ),
    [expiredItems, expiringItems],
  );

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const alerts: AlertItem[] = [
      ...expiringItems.map(
        (item): AlertItem => ({
          key: `expiring-${item.id}`,
          status: "expiring",
          item,
          alertQuantity: item.valid_until_quantity,
        }),
      ),
      ...expiredItems.map(
        (item): AlertItem => ({
          key: `expired-${item.id}`,
          status: "expired",
          item,
          alertQuantity: item.expired_quantity,
        }),
      ),
    ];

    return alerts
      .filter((alert) => status === "all" || alert.status === status)
      .filter(
        (alert) =>
          inventoryFilter === "all" ||
          alert.item.parish_inventory_id.toString() === inventoryFilter,
      )
      .filter((alert) => {
        if (!normalizedSearch) {
          return true;
        }

        const inventoryName =
          inventoryNames.get(alert.item.parish_inventory_id) ?? "";
        const searchableText = [
          alert.item.name,
          alert.item.description ?? "",
          inventoryName,
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return searchableText.includes(normalizedSearch);
      })
      .sort((first, second) => {
        const validityComparison = getFirstValidityDate(
          first.item.quantities,
        ).localeCompare(getFirstValidityDate(second.item.quantities));

        if (validityComparison !== 0) {
          return validityComparison;
        }

        return first.item.name.localeCompare(second.item.name, "pt-BR");
      });
  }, [
    expiredItems,
    expiringItems,
    inventoryFilter,
    inventoryNames,
    search,
    status,
  ]);

  const filtersApplied =
    status !== "all" || inventoryFilter !== "all" || search.trim().length > 0;

  function clearFilters() {
    setStatus("all");
    setInventoryFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Vencendo em 7 dias
              </p>
              <p className="text-2xl font-bold text-foreground">
                {expiringQuantity}
              </p>
              <p className="text-xs text-muted-foreground">
                {expiringItems.length} item(ns) com lotes próximos do vencimento
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-700">
              <CalendarClock className="size-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Quantidade vencida
              </p>
              <p className="text-2xl font-bold text-foreground">
                {expiredQuantity}
              </p>
              <p className="text-xs text-muted-foreground">
                {expiredItems.length} item(ns) com lotes expirados
              </p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
              <PackageX className="size-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 xl:col-span-1">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Lotes sob alerta
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalAlertLots}
              </p>
              <p className="text-xs text-muted-foreground">
                Soma dos lotes próximos do vencimento e vencidos
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Alertas de validade</CardTitle>
              <CardDescription>
                Acompanhe os lotes que vencem nos próximos sete dias e os que
                já estão vencidos.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {filteredAlerts.length} resultado(s)
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar item, descrição ou inventário"
                className="pl-9"
                aria-label="Buscar nos alertas de validade"
              />
            </div>

            <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
              <SelectTrigger aria-label="Filtrar alertas por inventário">
                <SelectValue placeholder="Todos os inventários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os inventários</SelectItem>
                {inventories.map((inventory) => (
                  <SelectItem key={inventory.id} value={inventory.id.toString()}>
                    {inventory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={!filtersApplied}
            >
              <RotateCcw aria-hidden="true" />
              Limpar filtros
            </Button>
          </div>

          <div
            className="flex gap-2 overflow-x-auto"
            aria-label="Filtrar por situação da validade"
          >
            {(
              [
                ["all", "Todos"],
                ["expiring", "Vencendo"],
                ["expired", "Vencidos"],
              ] as Array<[ValidityStatus, string]>
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={status === value ? "default" : "outline"}
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <PackageSearch
                className="size-9 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-foreground">
                  {filtersApplied
                    ? "Nenhum alerta corresponde aos filtros"
                    : "Nenhum alerta de validade encontrado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filtersApplied
                    ? "Revise a busca ou limpe os filtros aplicados."
                    : "Não há lotes vencendo nos próximos sete dias nem lotes vencidos."}
                </p>
              </div>
              {filtersApplied && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  <RotateCcw aria-hidden="true" />
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const inventoryName =
                  inventoryNames.get(alert.item.parish_inventory_id) ??
                  "Inventário não identificado";
                const lots = sortLots(alert.item.quantities);
                const expired = alert.status === "expired";

                return (
                  <article
                    key={alert.key}
                    className={`rounded-xl border p-4 ${
                      expired
                        ? "border-destructive/30 bg-destructive/[0.02]"
                        : "border-amber-500/30 bg-amber-500/[0.03]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={expired ? "destructive" : "secondary"}>
                            {expired ? "Vencido" : "Vencendo"}
                          </Badge>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Warehouse className="size-3.5" aria-hidden="true" />
                            {inventoryName}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">
                            {alert.item.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.item.description || "Sem descrição"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {lots.length} {pluralizeLots(lots.length)}
                        </Badge>
                        <Badge variant={expired ? "destructive" : "secondary"}>
                          {alert.alertQuantity} unidade(s) sob alerta
                        </Badge>
                        {onOpenInventory && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onOpenInventory(alert.item.parish_inventory_id)
                            }
                          >
                            Abrir inventário
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {lots.map((lot) => (
                        <div
                          key={lot.id}
                          className="rounded-lg border bg-background px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {lot.quantity} unidade(s)
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Validade: {formatDate(lot.valid_until)}
                              </p>
                            </div>
                            <CalendarClock
                              className={`size-4 shrink-0 ${
                                expired ? "text-destructive" : "text-amber-700"
                              }`}
                              aria-hidden="true"
                            />
                          </div>
                          <p
                            className={`mt-2 text-xs font-semibold ${
                              expired ? "text-destructive" : "text-amber-700"
                            }`}
                          >
                            {formatRelativeDate(lot.valid_until)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      Saldo total atual do item: {alert.item.total_quantity}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
