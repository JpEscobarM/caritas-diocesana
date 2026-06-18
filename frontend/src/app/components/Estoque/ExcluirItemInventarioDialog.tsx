import { AlertTriangle, Loader2 } from "lucide-react";

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

export interface ExcluirItemInventarioDialogProps {
  open: boolean;
  item: ParishInventoryItem | null;
  deleting?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export default function ExcluirItemInventarioDialog({
  open,
  item,
  deleting = false,
  error = null,
  onOpenChange,
  onConfirm,
}: ExcluirItemInventarioDialogProps) {
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
          <DialogTitle>Excluir item?</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o item{" "}
            <strong className="text-foreground">
              {item?.name ?? "selecionado"}
            </strong>
            . Todos os lotes e quantidades vinculados a ele também serão
            removidos. Esta ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Saldo atual: <strong>{item.total_quantity}</strong> unidade(s) em{" "}
            <strong>{item.quantities.length}</strong> lote(s).
          </div>
        )}

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
            disabled={deleting || !item}
          >
            {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            Excluir item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
