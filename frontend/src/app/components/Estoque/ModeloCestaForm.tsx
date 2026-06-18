import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  ClipboardList,
  Loader2,
  Package,
  Search,
  Warehouse,
} from "lucide-react";

import type {
  BasketTemplate,
  BasketTemplatePayloadItem,
  ParishInventory,
  ParishInventoryItem,
} from "../../types/EstoqueTypes";
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

export interface ModeloCestaFormValues {
  name: string;
  description: string | null;
  active: boolean;
  items: BasketTemplatePayloadItem[];
}

export interface ModeloCestaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parishId: number;
  inventories: ParishInventory[];
  inventoryItems: ParishInventoryItem[];
  template?: BasketTemplate | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (values: ModeloCestaFormValues) => Promise<void> | void;
}

type ItemQuantitiesState = Record<number, string>;

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function buildInitialQuantities(
  template: BasketTemplate | null,
): ItemQuantitiesState {
  if (!template) {
    return {};
  }

  return Object.fromEntries(
    template.items.map((item) => [
      item.parish_inventory_item_id,
      item.quantity.toString(),
    ]),
  );
}

function isPositiveInteger(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export default function ModeloCestaForm({
  open,
  onOpenChange,
  parishId,
  inventories,
  inventoryItems,
  template = null,
  saving = false,
  error = null,
  onSubmit,
}: ModeloCestaFormProps) {
  const editing = template !== null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [itemQuantities, setItemQuantities] =
    useState<ItemQuantitiesState>({});
  const [search, setSearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setActive(template?.active ?? true);
    setItemQuantities(buildInitialQuantities(template));
    setSearch("");
    setInventoryFilter("all");
    setSubmitted(false);
  }, [open, template]);

  const inventoryNames = useMemo(
    () =>
      new Map(
        inventories.map((inventory) => [inventory.id, inventory.name] as const),
      ),
    [inventories],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return [...inventoryItems]
      .filter(
        (item) =>
          inventoryFilter === "all" ||
          item.parish_inventory_id.toString() === inventoryFilter,
      )
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          item.name,
          item.description ?? "",
          inventoryNames.get(item.parish_inventory_id) ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return searchableText.includes(normalizedSearch);
      })
      .sort((first, second) => {
        const inventoryComparison =
          (inventoryNames.get(first.parish_inventory_id) ?? "").localeCompare(
            inventoryNames.get(second.parish_inventory_id) ?? "",
            "pt-BR",
          );

        if (inventoryComparison !== 0) {
          return inventoryComparison;
        }

        return first.name.localeCompare(second.name, "pt-BR");
      });
  }, [inventoryFilter, inventoryItems, inventoryNames, search]);

  const selectedItems = useMemo(
    () =>
      inventoryItems
        .filter((item) => itemQuantities[item.id] !== undefined)
        .map((item) => ({
          item,
          quantity: itemQuantities[item.id],
        })),
    [inventoryItems, itemQuantities],
  );

  const selectedItemsValid = selectedItems.every(({ quantity }) =>
    isPositiveInteger(quantity),
  );
  const normalizedName = name.trim();
  const formValid =
    normalizedName.length > 0 &&
    selectedItems.length > 0 &&
    selectedItemsValid;

  const nameInvalid = submitted && normalizedName.length === 0;
  const itemsInvalid = submitted && selectedItems.length === 0;
  const quantitiesInvalid = submitted && !selectedItemsValid;

  function toggleItem(itemId: number) {
    setItemQuantities((current) => {
      if (current[itemId] !== undefined) {
        const next = { ...current };
        delete next[itemId];
        return next;
      }

      return {
        ...current,
        [itemId]: "1",
      };
    });
  }

  function updateItemQuantity(itemId: number, value: string) {
    setItemQuantities((current) => ({
      ...current,
      [itemId]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      description: description.trim() || null,
      active,
      items: selectedItems.map(({ item, quantity }) => ({
        parish_inventory_item_id: item.id,
        quantity: Number(quantity),
      })),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" aria-hidden="true" />
              {editing ? "Editar modelo de cesta" : "Novo modelo de cesta"}
            </DialogTitle>
            <DialogDescription>
              Defina os produtos e a quantidade padrão de cada item em uma cesta.
              O modelo não movimenta o estoque até que uma entrega seja registrada.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basket-template-name">Nome do modelo</Label>
              <Input
                id="basket-template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Exemplo: Cesta básica mensal"
                disabled={saving}
                aria-invalid={nameInvalid}
                aria-describedby={
                  nameInvalid ? "basket-template-name-error" : undefined
                }
                autoFocus
                required
              />
              {nameInvalid && (
                <p
                  id="basket-template-name-error"
                  className="text-sm text-destructive"
                >
                  Informe o nome do modelo.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Situação</Label>
              <button
                type="button"
                onClick={() => setActive((current) => !current)}
                disabled={saving || !editing}
                aria-pressed={active}
                className={`flex min-h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-input bg-background"
                }`}
              >
                <span>
                  <span className="block font-medium text-foreground">
                    {active ? "Modelo ativo" : "Modelo inativo"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {editing
                      ? "Clique para alterar a situação."
                      : "Novos modelos são criados como ativos."}
                  </span>
                </span>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {active && <Check className="size-4" aria-hidden="true" />}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="basket-template-description">Descrição</Label>
            <textarea
              id="basket-template-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva quando ou para quem este modelo é utilizado"
              disabled={saving}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Label>Itens da cesta</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione pelo menos um item e informe a quantidade por cesta.
                </p>
              </div>
              <Badge variant="secondary">
                {selectedItems.length} selecionado(s)
              </Badge>
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
                  placeholder="Buscar item, descrição ou inventário"
                  className="pl-9"
                  disabled={saving}
                  aria-label="Buscar itens para o modelo"
                />
              </div>

              <Select
                value={inventoryFilter}
                onValueChange={setInventoryFilter}
                disabled={saving}
              >
                <SelectTrigger aria-label="Filtrar itens por inventário">
                  <SelectValue placeholder="Todos os inventários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os inventários</SelectItem>
                  {inventories.map((inventory) => (
                    <SelectItem
                      key={inventory.id}
                      value={inventory.id.toString()}
                    >
                      {inventory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {itemsInvalid && (
              <p className="text-sm text-destructive">
                Selecione pelo menos um item para compor a cesta.
              </p>
            )}

            {quantitiesInvalid && (
              <p className="text-sm text-destructive">
                Todas as quantidades selecionadas devem ser números inteiros
                maiores que zero.
              </p>
            )}

            <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border p-2">
              {inventoryItems.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center">
                  <Package
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      Nenhum item disponível
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cadastre itens no estoque antes de criar um modelo de cesta.
                    </p>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center">
                  <Search
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted-foreground">
                    Nenhum item corresponde aos filtros atuais.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const selected = itemQuantities[item.id] !== undefined;
                  const quantity = itemQuantities[item.id] ?? "1";
                  const quantityInvalid = selected && !isPositiveInteger(quantity);

                  return (
                    <div
                      key={item.id}
                      className={`grid gap-3 rounded-lg border p-3 transition-colors sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center ${
                        selected ? "border-primary/40 bg-primary/5" : "bg-card"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        disabled={saving}
                        aria-pressed={selected}
                        className="flex min-w-0 items-start gap-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && (
                            <Check className="size-3.5" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Warehouse className="size-3.5" aria-hidden="true" />
                              {inventoryNames.get(item.parish_inventory_id) ??
                                `Inventário ${item.parish_inventory_id}`}
                            </span>
                            <span>Saldo: {item.total_quantity}</span>
                          </span>
                          {item.description && (
                            <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </span>
                      </button>

                      <div className="space-y-1">
                        <Label
                          htmlFor={`basket-template-item-${item.id}`}
                          className="text-xs"
                        >
                          Quantidade
                        </Label>
                        <Input
                          id={`basket-template-item-${item.id}`}
                          type="number"
                          min="1"
                          step="1"
                          value={quantity}
                          onChange={(event) =>
                            updateItemQuantity(item.id, event.target.value)
                          }
                          onFocus={() => {
                            if (!selected) {
                              setItemQuantities((current) => ({
                                ...current,
                                [item.id]: "1",
                              }));
                            }
                          }}
                          disabled={saving || !selected}
                          aria-invalid={submitted && quantityInvalid}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Paróquia vinculada: <strong>{parishId}</strong>. A composição poderá
            ser ajustada no momento da entrega, sem alterar este modelo.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !formValid}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {editing ? "Salvar alterações" : "Criar modelo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
