import { useMemo, useState } from "react";
import {
  Boxes,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  Warehouse,
} from "lucide-react";

import type { ParishInventory } from "../../types/EstoqueTypes";
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

export interface InventariosListProps {
  inventories: ParishInventory[];
  selectedInventoryId: number | null;
  onSelect: (inventoryId: number) => void;
  onCreate?: () => void;
  onEdit?: (inventory: ParishInventory) => void;
  onDelete?: (inventory: ParishInventory) => void;
  actionsDisabled?: boolean;
  compact?: boolean;
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export default function InventariosList({
  inventories,
  selectedInventoryId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  actionsDisabled = false,
  compact = false,
}: InventariosListProps) {
  const [search, setSearch] = useState("");
  const showActions = !compact && Boolean(onEdit || onDelete);

  const filteredInventories = useMemo(() => {
    const normalized = normalizeSearch(search);

    if (!normalized) {
      return inventories;
    }

    return inventories.filter((inventory) =>
      [inventory.name, inventory.description ?? ""]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalized),
    );
  }, [inventories, search]);

  const listScrollClass = compact
    ? "max-h-80 overflow-y-auto pr-2"
    : "max-h-[calc(100vh-24rem)] overflow-y-auto pr-2";

  return (
    <Card className="min-h-0">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Inventários</CardTitle>
            <CardDescription>
              Selecione um inventário para consultar seus itens e lotes.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{inventories.length}</Badge>
            {!compact && onCreate && (
              <Button
                type="button"
                size="sm"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Novo inventário
              </Button>
            )}
          </div>
        </div>

        {inventories.length > 0 && (
          <div className="relative pt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar inventário pelo nome ou descrição"
              className="pl-9"
              aria-label="Buscar inventários"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="min-h-0 space-y-3">
        {inventories.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Warehouse
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">Nenhum inventário</p>
              <p className="text-sm text-muted-foreground">
                Esta paróquia ainda não possui inventários cadastrados.
              </p>
            </div>

            {!compact && onCreate && (
              <Button
                type="button"
                variant="outline"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Criar primeiro inventário
              </Button>
            )}
          </div>
        ) : filteredInventories.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Search className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum inventário encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Revise a busca informada para visualizar outros inventários.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => setSearch("")}>
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className={`space-y-3 ${listScrollClass}`}>
            {filteredInventories.map((inventory) => {
              const selected = inventory.id === selectedInventoryId;

              return (
                <div
                  key={inventory.id}
                  className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50 hover:bg-accent/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(inventory.id)}
                    aria-pressed={selected}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Boxes className="size-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {inventory.name}
                      </p>
                      {!compact && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {inventory.description || "Sem descrição"}
                        </p>
                      )}
                    </div>

                    {!showActions && (
                      <ChevronRight
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {showActions && (
                    <div className="flex shrink-0 items-center gap-1">
                      {onEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(inventory)}
                          disabled={actionsDisabled}
                          aria-label={`Editar inventário ${inventory.name}`}
                          title="Editar inventário"
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(inventory)}
                          disabled={actionsDisabled}
                          aria-label={`Excluir inventário ${inventory.name}`}
                          title="Excluir inventário"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
