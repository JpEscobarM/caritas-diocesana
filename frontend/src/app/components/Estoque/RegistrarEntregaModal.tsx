import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Gift,
  Loader2,
  Package,
  Search,
  Users,
  Warehouse,
} from "lucide-react";

import type {
  BasketTemplate,
  CreateBasketDeliveryItemPayload,
  CreateBasketDeliveryPayload,
  ParishInventory,
  ParishInventoryItem,
} from "../../types/EstoqueTypes";
import type { Family } from "../../types/types";
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

export interface RegistrarEntregaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parishId: number;
  families: Family[];
  templates: BasketTemplate[];
  inventories: ParishInventory[];
  inventoryItems: ParishInventoryItem[];
  saving?: boolean;
  error?: string | null;
  onSubmit: (payload: CreateBasketDeliveryPayload) => Promise<void> | void;
}

type DeliveryMode = "template" | "custom";

type DeliveryItemState = {
  selected: boolean;
  quantity: string;
  lotId: string;
};

type DeliveryItemsState = Record<number, DeliveryItemState>;

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function toLocalDateTimeInputValue(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toApiDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function isPositiveInteger(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export default function RegistrarEntregaModal({
  open,
  onOpenChange,
  parishId,
  families,
  templates,
  inventories,
  inventoryItems,
  saving = false,
  error = null,
  onSubmit,
}: RegistrarEntregaModalProps) {
  const [familySearch, setFamilySearch] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [mode, setMode] = useState<DeliveryMode>("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [itemSearch, setItemSearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [itemsState, setItemsState] = useState<DeliveryItemsState>({});
  const [deliveredAt, setDeliveredAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeTemplates = useMemo(
    () => templates.filter((template) => template.active),
    [templates],
  );

  const selectedTemplate = useMemo(
    () =>
      activeTemplates.find((template) => template.id === selectedTemplateId) ??
      null,
    [activeTemplates, selectedTemplateId],
  );

  const selectedFamily = useMemo(
    () => families.find((family) => family.id === selectedFamilyId) ?? null,
    [families, selectedFamilyId],
  );

  const inventoryNames = useMemo(
    () =>
      new Map(
        inventories.map((inventory) => [inventory.id, inventory.name] as const),
      ),
    [inventories],
  );

  const filteredFamilies = useMemo(() => {
    const normalized = normalizeSearch(familySearch);

    return [...families]
      .filter((family) => {
        if (!normalized) {
          return true;
        }

        return [
          family.name,
          family.responsible?.name ?? "",
          family.address ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      })
      .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  }, [families, familySearch]);

  const filteredItems = useMemo(() => {
    const normalized = normalizeSearch(itemSearch);

    return [...inventoryItems]
      .filter(
        (item) =>
          inventoryFilter === "all" ||
          item.parish_inventory_id.toString() === inventoryFilter,
      )
      .filter((item) => {
        if (!normalized) {
          return true;
        }

        return [
          item.name,
          item.description ?? "",
          inventoryNames.get(item.parish_inventory_id) ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      })
      .sort((first, second) => {
        const inventoryComparison = (
          inventoryNames.get(first.parish_inventory_id) ?? ""
        ).localeCompare(
          inventoryNames.get(second.parish_inventory_id) ?? "",
          "pt-BR",
        );

        if (inventoryComparison !== 0) {
          return inventoryComparison;
        }

        return first.name.localeCompare(second.name, "pt-BR");
      });
  }, [inventoryFilter, inventoryItems, inventoryNames, itemSearch]);

  const selectedEntries = useMemo(
    () =>
      inventoryItems
        .filter((item) => itemsState[item.id]?.selected)
        .map((item) => ({ item, state: itemsState[item.id] })),
    [inventoryItems, itemsState],
  );

  const invalidSelectedEntries = useMemo(
    () =>
      selectedEntries.filter(({ item, state }) => {
        if (!state || !isPositiveInteger(state.quantity)) {
          return true;
        }

        const quantity = Number(state.quantity);

        if (state.lotId === "auto") {
          return quantity > item.total_quantity;
        }

        const selectedLot = item.quantities.find(
          (lot) => lot.id === Number(state.lotId),
        );

        return !selectedLot || quantity > selectedLot.quantity;
      }),
    [selectedEntries],
  );

  const totalUnits = selectedEntries.reduce(
    (total, entry) => total + (Number(entry.state?.quantity) || 0),
    0,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setFamilySearch("");
    setSelectedFamilyId(null);
    setMode(activeTemplates.length > 0 ? "template" : "custom");
    setSelectedTemplateId(activeTemplates[0]?.id ?? null);
    setItemSearch("");
    setInventoryFilter("all");
    setDeliveredAt(toLocalDateTimeInputValue());
    setNotes("");
    setSubmitted(false);
  }, [activeTemplates, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "custom") {
      setItemsState({});
      return;
    }

    if (!selectedTemplate) {
      setItemsState({});
      return;
    }

    const nextState: DeliveryItemsState = {};

    selectedTemplate.items.forEach((templateItem) => {
      nextState[templateItem.parish_inventory_item_id] = {
        selected: true,
        quantity: templateItem.quantity.toString(),
        lotId: "auto",
      };
    });

    setItemsState(nextState);
  }, [mode, open, selectedTemplate]);

  function toggleItem(itemId: number) {
    setItemsState((current) => {
      const currentState = current[itemId];

      return {
        ...current,
        [itemId]: currentState
          ? { ...currentState, selected: !currentState.selected }
          : { selected: true, quantity: "1", lotId: "auto" },
      };
    });
  }

  function updateItemState(itemId: number, patch: Partial<DeliveryItemState>) {
    setItemsState((current) => ({
      ...current,
      [itemId]: {
        selected: current[itemId]?.selected ?? true,
        quantity: current[itemId]?.quantity ?? "1",
        lotId: current[itemId]?.lotId ?? "auto",
        ...patch,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!selectedFamilyId) {
      return;
    }

    if (mode === "template" && !selectedTemplateId) {
      return;
    }

    if (selectedEntries.length === 0 || invalidSelectedEntries.length > 0) {
      return;
    }

    const items: CreateBasketDeliveryItemPayload[] = selectedEntries.map(
      ({ item, state }) => {
        const quantity = Number(state.quantity);

        if (state.lotId === "auto") {
          return {
            parish_inventory_item_id: item.id,
            quantity,
          };
        }

        return {
          parish_inventory_item_id: item.id,
          parish_inventory_item_quantity_id: Number(state.lotId),
          quantity,
        };
      },
    );

    const commonPayload = {
      family_id: selectedFamilyId,
      delivered_at: toApiDateTime(deliveredAt),
      notes: notes.trim() || null,
    };

    if (mode === "template" && selectedTemplateId) {
      await onSubmit({
        ...commonPayload,
        basket_template_id: selectedTemplateId,
        items,
      });
      return;
    }

    await onSubmit({
      ...commonPayload,
      items,
    });
  }

  const familyInvalid = submitted && selectedFamilyId === null;
  const templateInvalid =
    submitted && mode === "template" && selectedTemplateId === null;
  const itemsInvalid = submitted && selectedEntries.length === 0;
  const quantitiesInvalid = submitted && invalidSelectedEntries.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5" aria-hidden="true" />
            Registrar entrega para família
          </DialogTitle>
          <DialogDescription>
            Esta operação registra a saída da cesta e reduz os lotes do estoque.
            Sem lote específico, a API baixa primeiro os lotes com validade mais
            próxima.
          </DialogDescription>
        </DialogHeader>

        <form
          id="registrar-entrega-form"
          onSubmit={(event) => void handleSubmit(event)}
          className="min-h-0 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          <section className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <Users
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-foreground">1. Família</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione a família que receberá a cesta.
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={familySearch}
                onChange={(event) => setFamilySearch(event.target.value)}
                placeholder="Buscar por família, responsável ou endereço"
                className="pl-9"
                disabled={saving}
              />
            </div>

            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-2">
              {filteredFamilies.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma família ativa encontrada para esta paróquia.
                </p>
              ) : (
                filteredFamilies.map((family) => {
                  const selected = family.id === selectedFamilyId;

                  return (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => setSelectedFamilyId(family.id)}
                      disabled={saving}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {family.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          Responsável:{" "}
                          {family.responsible?.name ?? "Não informado"}
                          {family.address ? ` · ${family.address}` : ""}
                        </span>
                      </span>
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selected && (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {familyInvalid && (
              <p className="text-sm text-destructive">
                Selecione a família que receberá a cesta.
              </p>
            )}
          </section>

          <section className="space-y-4 rounded-xl border p-4">
            <div>
              <h3 className="font-semibold text-foreground">
                2. Tipo de cesta
              </h3>
              <p className="text-sm text-muted-foreground">
                Use um modelo ativo ou monte uma cesta personalizada.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("template")}
                disabled={saving || activeTemplates.length === 0}
                aria-pressed={mode === "template"}
                className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  mode === "template"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
              >
                <span className="block font-semibold text-foreground">
                  Usar modelo de cesta
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeTemplates.length} modelo(s) ativo(s) disponível(is).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("custom")}
                disabled={saving}
                aria-pressed={mode === "custom"}
                className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  mode === "custom"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
              >
                <span className="block font-semibold text-foreground">
                  Montar cesta na hora
                </span>
                <span className="text-xs text-muted-foreground">
                  Selecione livremente os produtos e quantidades.
                </span>
              </button>
            </div>

            {mode === "template" && (
              <div className="space-y-2">
                <Label htmlFor="basket-delivery-template">Modelo</Label>
                <Select
                  value={selectedTemplateId?.toString() ?? ""}
                  onValueChange={(value) =>
                    setSelectedTemplateId(Number(value))
                  }
                  disabled={saving}
                >
                  <SelectTrigger
                    id="basket-delivery-template"
                    aria-invalid={templateInvalid}
                  >
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map((template) => (
                      <SelectItem
                        key={template.id}
                        value={template.id.toString()}
                      >
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templateInvalid && (
                  <p className="text-sm text-destructive">
                    Selecione o modelo da cesta.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  3. Itens e lotes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste as quantidades e escolha um lote específico somente
                  quando necessário.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {selectedEntries.length} item(ns)
                </Badge>
                <Badge variant="outline">{totalUnits} unidade(s)</Badge>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Buscar produto ou inventário"
                  className="pl-9"
                  disabled={saving}
                />
              </div>

              <Select
                value={inventoryFilter}
                onValueChange={setInventoryFilter}
                disabled={saving}
              >
                <SelectTrigger aria-label="Filtrar por inventário">
                  <SelectValue />
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

            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Nenhum item encontrado.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const state = itemsState[item.id] ?? {
                    selected: false,
                    quantity: "1",
                    lotId: "auto",
                  };
                  const selectedLot =
                    state.lotId === "auto"
                      ? null
                      : (item.quantities.find(
                          (lot) => lot.id === Number(state.lotId),
                        ) ?? null);
                  const available =
                    selectedLot?.quantity ?? item.total_quantity;
                  const invalid =
                    state.selected &&
                    (!isPositiveInteger(state.quantity) ||
                      Number(state.quantity) > available);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl border p-3 ${
                        state.selected ? "border-primary/40 bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          disabled={saving}
                          aria-pressed={state.selected}
                          aria-label={`${state.selected ? "Remover" : "Adicionar"} ${item.name}`}
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                            state.selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {state.selected && (
                            <Check className="size-4" aria-hidden="true" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {inventoryNames.get(item.parish_inventory_id) ??
                                  "Inventário"}
                                {item.description
                                  ? ` · ${item.description}`
                                  : ""}
                              </p>
                            </div>
                            <Badge
                              variant={
                                item.total_quantity > 0
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              Saldo: {item.total_quantity}
                            </Badge>
                          </div>

                          {state.selected && (
                            <div className="mt-3 grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)]">
                              <div className="space-y-1.5">
                                <Label
                                  htmlFor={`delivery-item-quantity-${item.id}`}
                                >
                                  Quantidade
                                </Label>
                                <Input
                                  id={`delivery-item-quantity-${item.id}`}
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={state.quantity}
                                  onChange={(event) =>
                                    updateItemState(item.id, {
                                      quantity: event.target.value,
                                    })
                                  }
                                  disabled={saving}
                                  aria-invalid={invalid}
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label>Lote para baixa</Label>
                                <Select
                                  value={state.lotId}
                                  onValueChange={(value) =>
                                    updateItemState(item.id, { lotId: value })
                                  }
                                  disabled={saving}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">
                                      Automático — validade mais próxima
                                    </SelectItem>
                                    {item.quantities.map((lot) => (
                                      <SelectItem
                                        key={lot.id}
                                        value={lot.id.toString()}
                                        disabled={lot.quantity <= 0}
                                      >
                                        Lote #{lot.id} · {lot.quantity} un. ·{" "}
                                        {formatDate(lot.valid_until)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {invalid && (
                            <p className="mt-2 text-sm text-destructive">
                              Informe uma quantidade inteira entre 1 e{" "}
                              {available}.
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {itemsInvalid && (
              <p className="text-sm text-destructive">
                Selecione pelo menos um item para a entrega.
              </p>
            )}
            {quantitiesInvalid && (
              <p className="text-sm text-destructive">
                Revise as quantidades. Nenhum item pode ultrapassar o saldo
                disponível do item ou do lote escolhido.
              </p>
            )}
          </section>

          <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="basket-delivery-date"
                className="flex items-center gap-2"
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                Data e hora da entrega
              </Label>
              <Input
                id="basket-delivery-date"
                type="datetime-local"
                value={deliveredAt}
                onChange={(event) => setDeliveredAt(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2 sm:row-span-2">
              <Label htmlFor="basket-delivery-notes">Observações</Label>
              <textarea
                id="basket-delivery-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Exemplo: Entrega mensal realizada no atendimento"
                rows={4}
                disabled={saving}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground">Resumo</p>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Users className="size-4" aria-hidden="true" />
                  {selectedFamily?.name ?? "Família não selecionada"}
                </p>
                <p className="flex items-center gap-2">
                  <Package className="size-4" aria-hidden="true" />
                  {selectedEntries.length} item(ns), {totalUnits} unidade(s)
                </p>
                <p className="flex items-center gap-2">
                  <Warehouse className="size-4" aria-hidden="true" />
                  Paróquia #{parishId}
                </p>
              </div>
            </div>
          </section>
        </form>

        <DialogFooter className="border-t bg-background px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button form="registrar-entrega-form" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Registrando...
              </>
            ) : (
              <>
                <Gift aria-hidden="true" />
                Confirmar entrega
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
