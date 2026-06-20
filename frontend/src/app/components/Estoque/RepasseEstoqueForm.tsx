import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  PackagePlus,
  Plus,
  Trash2,
} from "lucide-react";

import type { CreateParishInventoryRepassePayload } from "../../types/EstoqueTypes";
import type { Parish } from "../../types/types";
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
import { Textarea } from "../ui/textarea";

export interface RepasseEstoqueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parishes: Parish[];
  defaultParishId?: number | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (
    payload: CreateParishInventoryRepassePayload,
  ) => Promise<void> | void;
}

interface RepasseItemState {
  clientId: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  valid_until: string;
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

function todayInputValue(): string {
  return toLocalDateTimeInputValue().slice(0, 10);
}

function createEmptyItem(): RepasseItemState {
  return {
    clientId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    description: "",
    quantity: "",
    unit: "",
    valid_until: "",
  };
}

function isPositiveInteger(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export default function RepasseEstoqueForm({
  open,
  onOpenChange,
  parishes,
  defaultParishId = null,
  saving = false,
  error = null,
  onSubmit,
}: RepasseEstoqueFormProps) {
  const [selectedParishId, setSelectedParishId] = useState<number | null>(null);
  const [deliveredAt, setDeliveredAt] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<RepasseItemState[]>(() => [
    createEmptyItem(),
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeParishes = useMemo(
    () =>
      [...parishes]
        .filter((parish) => parish.active)
        .sort((first, second) => first.name.localeCompare(second.name, "pt-BR")),
    [parishes],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedParishId(defaultParishId);
    setDeliveredAt(toLocalDateTimeInputValue());
    setNotes("");
    setItems([createEmptyItem()]);
    setSubmitted(false);
    setLocalError(null);
  }, [defaultParishId, open]);

  const minValidUntil = todayInputValue();
  const displayError = localError ?? error;

  function updateItem(clientId: string, changes: Partial<RepasseItemState>) {
    setItems((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, ...changes } : item,
      ),
    );
  }

  function removeItem(clientId: string) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((item) => item.clientId !== clientId),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setLocalError(null);

    if (!selectedParishId) {
      setLocalError("Selecione a paróquia que receberá o repasse.");
      return;
    }

    if (items.length === 0) {
      setLocalError("Informe pelo menos um item para o repasse.");
      return;
    }

    const invalidItem = items.find((item) => {
      const nameInvalid = item.name.trim().length === 0;
      const quantityInvalid = !isPositiveInteger(item.quantity);
      const validityInvalid =
        item.valid_until.trim().length === 0 ||
        item.valid_until < minValidUntil;

      return nameInvalid || quantityInvalid || validityInvalid;
    });

    if (invalidItem) {
      setLocalError(
        "Revise os itens: nome, quantidade positiva e validade não passada são obrigatórios.",
      );
      return;
    }

    onSubmit({
      parish_id: selectedParishId,
      delivered_at: toApiDateTime(deliveredAt),
      notes: notes.trim() || null,
      items: items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim() || null,
        quantity: Number(item.quantity),
        unit: item.unit.trim() || null,
        valid_until: item.valid_until,
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="size-5" aria-hidden="true" />
              Novo repasse
            </DialogTitle>
            <DialogDescription>
              Registre os itens enviados pela diocese. Ao confirmar, eles entram
              direto no estoque da paróquia selecionada.
            </DialogDescription>
          </DialogHeader>

          {displayError && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{displayError}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repasse-parish">Paróquia</Label>
              <Select
                value={selectedParishId?.toString() ?? ""}
                onValueChange={(value) => setSelectedParishId(Number(value))}
              >
                <SelectTrigger
                  id="repasse-parish"
                  aria-invalid={submitted && !selectedParishId}
                >
                  <SelectValue placeholder="Selecione a paróquia" />
                </SelectTrigger>
                <SelectContent>
                  {activeParishes.map((parish) => (
                    <SelectItem key={parish.id} value={parish.id.toString()}>
                      {parish.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repasse-date" className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden="true" />
                Data do repasse
              </Label>
              <Input
                id="repasse-date"
                type="datetime-local"
                value={deliveredAt}
                onChange={(event) => setDeliveredAt(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repasse-notes">Observações</Label>
            <Textarea
              id="repasse-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Exemplo: Repasse para prestação de contas"
              rows={3}
            />
          </div>

          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Itens</h3>
                <p className="text-sm text-muted-foreground">
                  Nome, quantidade e validade são obrigatórios por item.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItems((current) => [...current, createEmptyItem()])}
                disabled={saving}
              >
                <Plus aria-hidden="true" />
                Adicionar item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const nameInvalid = submitted && item.name.trim().length === 0;
                const quantityInvalid =
                  submitted && !isPositiveInteger(item.quantity);
                const validityInvalid =
                  submitted &&
                  (item.valid_until.trim().length === 0 ||
                    item.valid_until < minValidUntil);

                return (
                  <div
                    key={item.clientId}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">
                        Item {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.clientId)}
                        disabled={saving || items.length === 1}
                        aria-label={`Remover item ${index + 1}`}
                        title="Remover item"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_9rem_10rem]">
                      <div className="space-y-2">
                        <Label htmlFor={`repasse-item-name-${item.clientId}`}>
                          Nome
                        </Label>
                        <Input
                          id={`repasse-item-name-${item.clientId}`}
                          value={item.name}
                          onChange={(event) =>
                            updateItem(item.clientId, {
                              name: event.target.value,
                            })
                          }
                          placeholder="Arroz"
                          aria-invalid={nameInvalid}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`repasse-item-quantity-${item.clientId}`}>
                          Quantidade
                        </Label>
                        <Input
                          id={`repasse-item-quantity-${item.clientId}`}
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(item.clientId, {
                              quantity: event.target.value,
                            })
                          }
                          placeholder="20"
                          aria-invalid={quantityInvalid}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`repasse-item-unit-${item.clientId}`}>
                          Unidade
                        </Label>
                        <Input
                          id={`repasse-item-unit-${item.clientId}`}
                          value={item.unit}
                          onChange={(event) =>
                            updateItem(item.clientId, {
                              unit: event.target.value,
                            })
                          }
                          placeholder="pacote"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`repasse-item-valid-${item.clientId}`}>
                          Validade
                        </Label>
                        <Input
                          id={`repasse-item-valid-${item.clientId}`}
                          type="date"
                          min={minValidUntil}
                          value={item.valid_until}
                          onChange={(event) =>
                            updateItem(item.clientId, {
                              valid_until: event.target.value,
                            })
                          }
                          aria-invalid={validityInvalid}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`repasse-item-description-${item.clientId}`}>
                        Descrição
                      </Label>
                      <Input
                        id={`repasse-item-description-${item.clientId}`}
                        value={item.description}
                        onChange={(event) =>
                          updateItem(item.clientId, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Pacote 5kg"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || activeParishes.length === 0}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              Registrar repasse
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
