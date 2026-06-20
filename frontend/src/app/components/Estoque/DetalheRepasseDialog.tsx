import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  Loader2,
  Package,
} from "lucide-react";

import type { ParishInventoryRepasse } from "../../types/EstoqueTypes";
import type { Parish } from "../../types/types";
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

export interface DetalheRepasseDialogProps {
  open: boolean;
  repasse: ParishInventoryRepasse | null;
  parishes?: Parish[];
  loading?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsed);
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export default function DetalheRepasseDialog({
  open,
  repasse,
  parishes = [],
  loading = false,
  error = null,
  onOpenChange,
}: DetalheRepasseDialogProps) {
  const parishName =
    parishes.find((parish) => parish.id === repasse?.parish_id)?.name ??
    (repasse ? `Paróquia #${repasse.parish_id}` : "Paróquia");
  const totalUnits =
    repasse?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5" aria-hidden="true" />
            Detalhes do repasse
          </DialogTitle>
          <DialogDescription>
            Consulte a paróquia, a data e os itens repassados pela diocese.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Carregando detalhes do repasse.
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        ) : repasse ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Paróquia</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                  <Building2 className="size-4" aria-hidden="true" />
                  {parishName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Identificador #{repasse.parish_id}
                </p>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Data do repasse</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {formatDateTime(repasse.delivered_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Repasse #{repasse.id}
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Itens repassados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {repasse.items.length} item(ns), {totalUnits} unidade(s)
                  </p>
                </div>
                <Package className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                {repasse.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description || "Sem descrição"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">
                        {item.quantity} {item.unit || "un."}
                      </Badge>
                      <Badge variant="outline">
                        Validade: {formatDate(item.valid_until)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Observações
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {repasse.notes || "Nenhuma observação registrada."}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
