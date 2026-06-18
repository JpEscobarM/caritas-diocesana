import { AlertTriangle, Loader2 } from "lucide-react";

import type { BasketTemplate } from "../../types/EstoqueTypes";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export interface ExcluirModeloCestaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: BasketTemplate | null;
  deleting?: boolean;
  error?: string | null;
  onConfirm: () => Promise<void> | void;
}

export default function ExcluirModeloCestaDialog({
  open,
  onOpenChange,
  template,
  deleting = false,
  error = null,
  onConfirm,
}: ExcluirModeloCestaDialogProps) {
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
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Excluir modelo de cesta?</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o modelo{" "}
            <strong className="text-foreground">
              {template?.name ?? "selecionado"}
            </strong>
            . A composição deixará de estar disponível para novas entregas. Esta
            ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {template && (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            O modelo possui <strong>{template.items.length}</strong> item(ns) e
            está atualmente <strong>{template.active ? "ativo" : "inativo"}</strong>.
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
            disabled={deleting || !template}
          >
            {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            Excluir modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
