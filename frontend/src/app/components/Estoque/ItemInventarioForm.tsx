import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import type { ParishInventoryItem } from "../../types/EstoqueTypes";
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

export interface ItemInventarioFormValues {
  name: string;
  description: string | null;
  quantity?: number;
  valid_until?: string;
}

export interface ItemInventarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ParishInventoryItem | null;
  inventoryName?: string | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (values: ItemInventarioFormValues) => Promise<void> | void;
}

export default function ItemInventarioForm({
  open,
  onOpenChange,
  item = null,
  inventoryName = null,
  saving = false,
  error = null,
  onSubmit,
}: ItemInventarioFormProps) {
  const editing = item !== null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [validUntil, setValidUntil] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(item?.name ?? "");
    setDescription(item?.description ?? "");
    setQuantity("1");
    setValidUntil("");
    setSubmitted(false);
  }, [item, open]);

  const normalizedName = name.trim();
  const parsedQuantity = Number(quantity);
  const quantityValid =
    Number.isFinite(parsedQuantity) &&
    Number.isInteger(parsedQuantity) &&
    parsedQuantity > 0;
  const nameInvalid = submitted && normalizedName.length === 0;
  const quantityInvalid = submitted && !editing && !quantityValid;
  const validUntilInvalid = submitted && !editing && !validUntil;
  const formValid =
    normalizedName.length > 0 &&
    (editing || (quantityValid && validUntil.length > 0));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    if (editing) {
      await onSubmit({
        name: normalizedName,
        description: description.trim() || null,
      });
      return;
    }

    await onSubmit({
      name: normalizedName,
      description: description.trim() || null,
      quantity: parsedQuantity,
      valid_until: validUntil,
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
      <DialogContent>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize o nome e a descrição. O saldo e os lotes não são alterados nesta operação."
                : `Cadastre o item e sua primeira entrada${
                    inventoryName ? ` no inventário ${inventoryName}` : ""
                  }.`}
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

          <div className="space-y-2">
            <Label htmlFor="inventory-item-name">Nome do item</Label>
            <Input
              id="inventory-item-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Exemplo: Arroz"
              disabled={saving}
              aria-invalid={nameInvalid}
              aria-describedby={
                nameInvalid ? "inventory-item-name-error" : undefined
              }
              autoFocus
              required
            />
            {nameInvalid && (
              <p
                id="inventory-item-name-error"
                className="text-sm text-destructive"
              >
                Informe o nome do item.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventory-item-description">Descrição</Label>
            <textarea
              id="inventory-item-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Exemplo: Pacote de 5 kg"
              disabled={saving}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {!editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inventory-item-quantity">
                  Quantidade inicial
                </Label>
                <Input
                  id="inventory-item-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={saving}
                  aria-invalid={quantityInvalid}
                  aria-describedby={
                    quantityInvalid
                      ? "inventory-item-quantity-error"
                      : undefined
                  }
                  required
                />
                {quantityInvalid && (
                  <p
                    id="inventory-item-quantity-error"
                    className="text-sm text-destructive"
                  >
                    Informe uma quantidade inteira maior que zero.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory-item-valid-until">Validade</Label>
                <Input
                  id="inventory-item-valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  disabled={saving}
                  aria-invalid={validUntilInvalid}
                  aria-describedby={
                    validUntilInvalid
                      ? "inventory-item-valid-until-error"
                      : undefined
                  }
                  required
                />
                {validUntilInvalid && (
                  <p
                    id="inventory-item-valid-until-error"
                    className="text-sm text-destructive"
                  >
                    Informe a validade da primeira entrada.
                  </p>
                )}
              </div>
            </div>
          )}

          {!editing && (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              A quantidade inicial será registrada como o primeiro lote do item.
              Novas entradas serão implementadas na etapa de lotes.
            </p>
          )}

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
              {editing ? "Salvar alterações" : "Criar item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
