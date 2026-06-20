import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Building2,
  Loader2,
  Package,
  Search,
} from "lucide-react";

import type {
  ExpiredParishInventoryItem,
  ExpiringParishInventoryItem,
  ParishInventory,
  ParishInventoryItem,
} from "../../types/EstoqueTypes";
import type { Parish } from "../../types/types";
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

export interface ResumoEstoqueDioceseProps {
  parishes: Parish[];
  inventories: ParishInventory[];
  items: ParishInventoryItem[];
  expiringItems: ExpiringParishInventoryItem[];
  expiredItems: ExpiredParishInventoryItem[];
  onSelectParish: (parishId: number) => void | Promise<void>;
  selectingParishId?: number | null;
}

interface ParishSummary {
  parish: Parish;
  inventoriesCount: number;
  itemsCount: number;
  totalQuantity: number;
  expiringQuantity: number;
  expiredQuantity: number;
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export default function ResumoEstoqueDiocese({
  parishes,
  inventories,
  items,
  expiringItems,
  expiredItems,
  onSelectParish,
  selectingParishId = null,
}: ResumoEstoqueDioceseProps) {
  const [search, setSearch] = useState("");

  const summaries = useMemo<ParishSummary[]>(() => {
    return parishes
      .map((parish) => {
        const parishInventories = inventories.filter(
          (inventory) => inventory.parish_id === parish.id,
        );
        const inventoryIds = new Set(
          parishInventories.map((inventory) => inventory.id),
        );
        const parishItems = items.filter((item) =>
          inventoryIds.has(item.parish_inventory_id),
        );
        const parishExpiringItems = expiringItems.filter((item) =>
          inventoryIds.has(item.parish_inventory_id),
        );
        const parishExpiredItems = expiredItems.filter((item) =>
          inventoryIds.has(item.parish_inventory_id),
        );

        return {
          parish,
          inventoriesCount: parishInventories.length,
          itemsCount: parishItems.length,
          totalQuantity: parishItems.reduce(
            (total, item) => total + item.total_quantity,
            0,
          ),
          expiringQuantity: parishExpiringItems.reduce(
            (total, item) => total + item.valid_until_quantity,
            0,
          ),
          expiredQuantity: parishExpiredItems.reduce(
            (total, item) => total + item.expired_quantity,
            0,
          ),
        };
      })
      .sort((first, second) => {
        const firstHasStock = first.inventoriesCount > 0 || first.itemsCount > 0;
        const secondHasStock =
          second.inventoriesCount > 0 || second.itemsCount > 0;

        if (firstHasStock !== secondHasStock) {
          return firstHasStock ? -1 : 1;
        }

        return first.parish.name.localeCompare(second.parish.name, "pt-BR");
      });
  }, [expiredItems, expiringItems, inventories, items, parishes]);

  const filteredSummaries = useMemo(() => {
    const normalized = normalizeSearch(search);

    if (!normalized) {
      return summaries;
    }

    return summaries.filter((summary) =>
      summary.parish.name.toLocaleLowerCase("pt-BR").includes(normalized),
    );
  }, [search, summaries]);

  const parishesWithAlerts = summaries.filter(
    (summary) => summary.expiringQuantity > 0 || summary.expiredQuantity > 0,
  ).length;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Visão consolidada por paróquia</CardTitle>
            <CardDescription>
              Acompanhe saldos e alertas de todas as paróquias em um único
              painel. Abra uma paróquia para listar os itens do estoque dela.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{parishes.length} paróquia(s)</Badge>
            <Badge variant="outline">
              {parishesWithAlerts} com alerta(s)
            </Badge>
          </div>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar paróquia"
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredSummaries.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Building2
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Nenhuma paróquia encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                Revise a busca para visualizar outras paróquias.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => setSearch("")}> 
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSummaries.map((summary) => {
              const hasAlert =
                summary.expiringQuantity > 0 || summary.expiredQuantity > 0;
              const selectingThisParish =
                selectingParishId === summary.parish.id;

              return (
                <article
                  key={summary.parish.id}
                  className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {summary.parish.name}
                        </h3>
                        {hasAlert && (
                          <Badge variant="destructive">
                            Atenção à validade
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Boxes className="size-3.5" aria-hidden="true" />
                            Inventários
                          </p>
                          <p className="font-semibold text-foreground">
                            {summary.inventoriesCount}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Package className="size-3.5" aria-hidden="true" />
                            Itens
                          </p>
                          <p className="font-semibold text-foreground">
                            {summary.itemsCount}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <p className="text-xs text-muted-foreground">Saldo</p>
                          <p className="font-semibold text-foreground">
                            {summary.totalQuantity}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <AlertTriangle
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Validade
                          </p>
                          <p
                            className={`font-semibold ${
                              hasAlert ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {summary.expiringQuantity + summary.expiredQuantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void onSelectParish(summary.parish.id)}
                      disabled={selectingParishId !== null}
                    >
                      {selectingThisParish && (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      )}
                      {selectingThisParish ? "Carregando..." : "Listar estoque"}
                    </Button>
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
