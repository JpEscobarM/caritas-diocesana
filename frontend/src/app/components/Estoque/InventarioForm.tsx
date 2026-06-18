import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import type { ParishInventory } from "../../types/EstoqueTypes";
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

export interface InventarioFormValues {
  name: string;
  description: string | null;
}

export interface InventarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory?: ParishInventory | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (values: InventarioFormValues) => Promise<void> | void;
}

export default function InventarioForm({
  open,
  onOpenChange,
  inventory = null,
  saving = false,
  error = null,
  onSubmit,
}: InventarioFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(inventory?.name ?? "");
    setDescription(inventory?.description ?? "");
    setNameTouched(false);
  }, [inventory, open]);

  const normalizedName = name.trim();
  const nameInvalid = nameTouched && normalizedName.length === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);

    if (!normalizedName) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      description: description.trim() || null,
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
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {inventory ? "Editar inventário" : "Novo inventário"}
            </DialogTitle>
            <DialogDescription>
              Informe um nome claro para identificar onde os itens serão
              organizados.
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
            <Label htmlFor="inventory-name">Nome</Label>
            <Input
              id="inventory-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="Exemplo: Estoque principal"
              disabled={saving}
              aria-invalid={nameInvalid}
              aria-describedby={nameInvalid ? "inventory-name-error" : undefined}
              autoFocus
              required
            />
            {nameInvalid && (
              <p id="inventory-name-error" className="text-sm text-destructive">
                Informe o nome do inventário.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventory-description">Descrição</Label>
            <textarea
              id="inventory-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva a finalidade deste inventário"
              disabled={saving}
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
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
            <Button type="submit" disabled={saving || !normalizedName}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {inventory ? "Salvar alterações" : "Criar inventário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
