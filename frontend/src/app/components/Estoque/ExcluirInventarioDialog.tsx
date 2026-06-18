import { AlertTriangle, Loader2 } from "lucide-react";

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

export interface ExcluirInventarioDialogProps {
  open: boolean;
  inventory: ParishInventory | null;
  deleting?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export default function ExcluirInventarioDialog({
  open,
  inventory,
  deleting = false,
  error = null,
  onOpenChange,
  onConfirm,
}: ExcluirInventarioDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle aria-hidden="true" />
          </div>
          <DialogTitle>Excluir inventário?</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o inventário{" "}
            <strong className="text-foreground">
              {inventory?.name ?? "selecionado"}
            </strong>
            . Esta ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={deleting || !inventory}
          >
            {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            Excluir inventário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
