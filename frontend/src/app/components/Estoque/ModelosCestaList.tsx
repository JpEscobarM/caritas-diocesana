import { useMemo, useState } from "react";
import {
  ClipboardList,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  Warehouse,
} from "lucide-react";

import type {
  BasketTemplate,
  ParishInventory,
  ParishInventoryItem,
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

export interface ModelosCestaListProps {
  templates: BasketTemplate[];
  inventories?: ParishInventory[];
  inventoryItems?: ParishInventoryItem[];
  onCreate?: () => void;
  onEdit?: (template: BasketTemplate) => void;
  onDelete?: (template: BasketTemplate) => void;
  onToggleActive?: (template: BasketTemplate) => void;
  actionsDisabled?: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function getPossibleBaskets(template: BasketTemplate): number {
  if (template.items.length === 0) {
    return 0;
  }

  return Math.min(
    ...template.items.map((item) =>
      item.quantity > 0
        ? Math.floor(item.available_total_quantity / item.quantity)
        : 0,
    ),
  );
}

export default function ModelosCestaList({
  templates,
  inventories = [],
  inventoryItems = [],
  onCreate,
  onEdit,
  onDelete,
  onToggleActive,
  actionsDisabled = false,
}: ModelosCestaListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const inventoryNames = useMemo(
    () =>
      new Map(
        inventories.map((inventory) => [inventory.id, inventory.name] as const),
      ),
    [inventories],
  );

  const itemInventoryNames = useMemo(
    () =>
      new Map(
        inventoryItems.map((item) => [
          item.id,
          inventoryNames.get(item.parish_inventory_id) ??
            `Inventário ${item.parish_inventory_id}`,
        ] as const),
      ),
    [inventoryItems, inventoryNames],
  );

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return [...templates]
      .filter((template) => {
        if (statusFilter === "active") {
          return template.active;
        }

        if (statusFilter === "inactive") {
          return !template.active;
        }

        return true;
      })
      .filter((template) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          template.name,
          template.description ?? "",
          ...template.items.map((item) => item.name),
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return searchableText.includes(normalizedSearch);
      })
      .sort((first, second) => {
        if (first.active !== second.active) {
          return first.active ? -1 : 1;
        }

        return first.name.localeCompare(second.name, "pt-BR");
      });
  }, [search, statusFilter, templates]);

  const activeCount = templates.filter((template) => template.active).length;
  const filtersApplied = search.trim().length > 0 || statusFilter !== "all";

  return (
    <Card className="min-h-0">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Modelos de cesta</CardTitle>
            <CardDescription>
              Composições predefinidas utilizadas no registro das entregas.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{templates.length} modelo(s)</Badge>
            <Badge variant="outline">{activeCount} ativo(s)</Badge>
            {onCreate && (
              <Button
                type="button"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Novo modelo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {templates.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar modelo ou item"
                className="pl-9"
                aria-label="Buscar modelos de cesta"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger aria-label="Filtrar modelos por situação">
                <SelectValue placeholder="Todas as situações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as situações</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <ClipboardList
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum modelo cadastrado
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Crie uma composição padrão para agilizar as futuras entregas de
                cestas às famílias.
              </p>
            </div>
            {onCreate && (
              <Button
                type="button"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Criar primeiro modelo
              </Button>
            )}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Search
              className="size-9 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum modelo encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Ajuste os filtros para visualizar outros modelos.
              </p>
            </div>
            {filtersApplied && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid max-h-[calc(100vh-24rem)] gap-4 overflow-y-auto pr-2 xl:grid-cols-2">
            {filteredTemplates.map((template) => {
              const possibleBaskets = getPossibleBaskets(template);
              const insufficientItems = template.items.filter(
                (item) => item.available_total_quantity < item.quantity,
              );

              return (
                <article
                  key={template.id}
                  className="flex min-h-full flex-col rounded-xl border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {template.name}
                        </h3>
                        <Badge
                          variant={template.active ? "default" : "secondary"}
                        >
                          {template.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {template.description || "Sem descrição"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {onToggleActive && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onToggleActive(template)}
                          disabled={actionsDisabled}
                          title={
                            template.active
                              ? "Desativar modelo"
                              : "Ativar modelo"
                          }
                          aria-label={
                            template.active
                              ? `Desativar ${template.name}`
                              : `Ativar ${template.name}`
                          }
                        >
                          <Power aria-hidden="true" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(template)}
                          disabled={actionsDisabled}
                          title="Editar modelo"
                          aria-label={`Editar ${template.name}`}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(template)}
                          disabled={actionsDisabled}
                          title="Excluir modelo"
                          aria-label={`Excluir ${template.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Itens</p>
                      <p className="font-semibold text-foreground">
                        {template.items.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Cestas possíveis
                      </p>
                      <p className="font-semibold text-foreground">
                        {possibleBaskets}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Itens sem saldo
                      </p>
                      <p
                        className={`font-semibold ${
                          insufficientItems.length > 0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {insufficientItems.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 max-h-56 flex-1 space-y-2 overflow-y-auto pr-1">
                    {template.items.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        Este modelo não possui itens.
                      </div>
                    ) : (
                      template.items.map((item) => {
                        const inventoryName = itemInventoryNames.get(
                          item.parish_inventory_item_id,
                        );

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <Package
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {inventoryName ? `${inventoryName} · ` : ""}
                                  Saldo disponível: {item.available_total_quantity}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-semibold text-foreground">
                                {item.quantity}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                por cesta
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {inventoryNames.size > 0 && (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Warehouse className="size-3.5" aria-hidden="true" />
                      Itens provenientes dos inventários da paróquia
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
