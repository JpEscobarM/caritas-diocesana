import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import type {
  ParishInventoryItem,
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

export interface ItensInventarioListProps {
  items: ParishInventoryItem[];
  inventoryName: string | null;
  onCreate?: () => void;
  onAddLot?: (item: ParishInventoryItem) => void;
  onEdit?: (item: ParishInventoryItem) => void;
  onDelete?: (item: ParishInventoryItem) => void;
  actionsDisabled?: boolean;
  compact?: boolean;
}

function formatDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

function sortLots(
  quantities: ParishInventoryItemQuantity[],
): ParishInventoryItemQuantity[] {
  return [...quantities].sort((first, second) =>
    first.valid_until.localeCompare(second.valid_until),
  );
}

export default function ItensInventarioList({
  items,
  inventoryName,
  onCreate,
  onAddLot,
  onEdit,
  onDelete,
  actionsDisabled = false,
  compact = false,
}: ItensInventarioListProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch("");
  }, [inventoryName]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const sortedItems = [...items].sort((first, second) =>
      first.name.localeCompare(second.name, "pt-BR"),
    );

    if (!normalizedSearch) {
      return sortedItems;
    }

    return sortedItems.filter((item) => {
      const name = item.name.toLocaleLowerCase("pt-BR");
      const description = item.description?.toLocaleLowerCase("pt-BR") ?? "";

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [items, search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Itens do inventário</CardTitle>
            <CardDescription>
              {inventoryName
                ? `Inventário selecionado: ${inventoryName}`
                : "Selecione um inventário para visualizar seus itens."}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{items.length}</Badge>
            {!compact && inventoryName && onCreate && (
              <Button
                type="button"
                size="sm"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Novo item
              </Button>
            )}
          </div>
        </div>

        {!compact && inventoryName && (
          <div className="relative pt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar item pelo nome ou descrição"
              className="pl-9"
              aria-label="Buscar itens do inventário"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!inventoryName ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Package className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Selecione um inventário ao lado para continuar.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Package className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum item encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Revise a busca informada."
                  : "Este inventário ainda não possui itens cadastrados."}
              </p>
            </div>

            {!compact && !search && onCreate && (
              <Button
                type="button"
                variant="outline"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Criar primeiro item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground">
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description || "Sem descrição"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Badge className="mr-1">Total: {item.total_quantity}</Badge>

                    {!compact && onAddLot && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddLot(item)}
                        disabled={actionsDisabled}
                        aria-label={`Registrar entrada para ${item.name}`}
                        title="Registrar nova entrada"
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <PackagePlus aria-hidden="true" />
                      </Button>
                    )}

                    {!compact && onEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        disabled={actionsDisabled}
                        aria-label={`Editar item ${item.name}`}
                        title="Editar item"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                    )}

                    {!compact && onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        disabled={actionsDisabled}
                        aria-label={`Excluir item ${item.name}`}
                        title="Excluir item"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>

                {!compact && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Lotes e validades
                      </p>
                      <Badge variant="outline">
                        {item.quantities.length} {item.quantities.length === 1 ? "lote" : "lotes"}
                      </Badge>
                    </div>
                    {item.quantities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum lote disponível.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sortLots(item.quantities).map((lot) => (
                          <div
                            key={lot.id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {lot.quantity} unidade(s)
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              <CalendarDays
                                className="size-4"
                                aria-hidden="true"
                              />
                              {formatDate(lot.valid_until)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
