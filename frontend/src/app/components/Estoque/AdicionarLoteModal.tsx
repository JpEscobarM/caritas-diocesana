import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, CalendarDays, Loader2, PackagePlus } from "lucide-react";

import type {
  AddParishInventoryItemQuantityPayload,
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

export interface AdicionarLoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ParishInventoryItem | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (
    payload: AddParishInventoryItemQuantityPayload,
  ) => Promise<void> | void;
}

function formatDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

export default function AdicionarLoteModal({
  open,
  onOpenChange,
  item,
  saving = false,
  error = null,
  onSubmit,
}: AdicionarLoteModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [validUntil, setValidUntil] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity("1");
      setValidUntil("");
      setSubmitted(false);
    }
  }, [open, item?.id]);

  const parsedQuantity = Number(quantity);
  const quantityValid =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0;
  const validUntilValid = /^\d{4}-\d{2}-\d{2}$/.test(validUntil);
  const formValid = Boolean(item && quantityValid && validUntilValid);

  const sortedExistingLots = useMemo(
    () =>
      [...(item?.quantities ?? [])].sort((first, second) =>
        first.valid_until.localeCompare(second.valid_until),
      ),
    [item],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    await onSubmit({
      quantity: parsedQuantity,
      valid_until: validUntil,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="size-5" aria-hidden="true" />
              Registrar entrada
            </DialogTitle>
            <DialogDescription>
              {item
                ? `Adicione uma nova quantidade ao item ${item.name}. Cada entrada fica registrada com sua própria validade.`
                : "Selecione um item antes de registrar a entrada."}
            </DialogDescription>
          </DialogHeader>

          {item && (
            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Item
                </p>
                <p className="mt-1 font-semibold text-foreground">{item.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total atual
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {item.total_quantity}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Lotes atuais
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {item.quantities.length}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lot-quantity">Quantidade recebida</Label>
              <Input
                id="lot-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={saving || !item}
                aria-invalid={submitted && !quantityValid}
                aria-describedby={
                  submitted && !quantityValid ? "lot-quantity-error" : undefined
                }
                autoFocus
                required
              />
              {submitted && !quantityValid && (
                <p id="lot-quantity-error" className="text-sm text-destructive">
                  Informe uma quantidade inteira maior que zero.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-valid-until">Validade do lote</Label>
              <Input
                id="lot-valid-until"
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                disabled={saving || !item}
                aria-invalid={submitted && !validUntilValid}
                aria-describedby={
                  submitted && !validUntilValid
                    ? "lot-valid-until-error"
                    : undefined
                }
                required
              />
              {submitted && !validUntilValid && (
                <p
                  id="lot-valid-until-error"
                  className="text-sm text-destructive"
                >
                  Informe a validade desta entrada.
                </p>
              )}
            </div>
          </div>

          {item && sortedExistingLots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Lotes já registrados
                </p>
                <Badge variant="outline">{sortedExistingLots.length}</Badge>
              </div>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border p-2">
                {sortedExistingLots.map((lot) => (
                  <div
                    key={lot.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {lot.quantity} unidade(s)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      {formatDate(lot.valid_until)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            A API registrará um novo lote e somará a quantidade ao total geral do
            item automaticamente. Mesmo quando a validade coincidir com uma já
            existente, a nova entrada continuará registrada no histórico de lotes.
          </p>

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
              Registrar entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
