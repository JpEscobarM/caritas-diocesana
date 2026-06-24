import { type FormEvent, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import type { HomeVisitWithFamily } from "./types";
import { formatDateTime } from "./utils";

type CancelVisitModalProps = {
  open: boolean;
  visit: HomeVisitWithFamily | null;
  onClose: () => void;
  onCancelVisit: (visitId: number) => Promise<void>;
};

export default function CancelVisitModal({
  open,
  visit,
  onClose,
  onCancelVisit,
}: CancelVisitModalProps) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !visit) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      await onCancelVisit(visit.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-visit-title"
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-amber-100 p-2 text-amber-800">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="cancel-visit-title"
                className="caritas-mobile-safe pr-1 text-xl font-bold text-[var(--primary)] sm:text-2xl"
              >
                Cancelar visita
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                {visit.family?.name ?? `Família #${visit.family_id}`} — {formatDateTime(visit.visit_date)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Fechar janela de cancelamento"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(100dvh-8rem)] space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 px-4 py-4">
            <p className="text-lg font-bold text-amber-950">
              Tem certeza que deseja cancelar esta visita?
            </p>
            <p className="mt-2 text-base leading-relaxed text-amber-950">
              O registro continuará no histórico, mas a visita não aparecerá mais
              como pendente.
            </p>
          </div>

          <div className="grid gap-3 border-t border-slate-200 pt-5 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Voltar sem cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 rounded-xl bg-amber-700 px-5 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              {saving ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
