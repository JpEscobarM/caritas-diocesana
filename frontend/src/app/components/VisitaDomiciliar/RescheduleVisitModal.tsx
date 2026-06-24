import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import type { HomeVisitWithFamily, RescheduleHomeVisitRequest } from "./types";
import {
  formatDateTime,
  getCurrentDatetimeLocalValue,
  isDateTimeInPast,
  toApiDateTime,
  toDatetimeLocalValue,
} from "./utils";

type RescheduleVisitModalProps = {
  open: boolean;
  visit: HomeVisitWithFamily | null;
  onClose: () => void;
  onReschedule: (
    visitId: number,
    payload: RescheduleHomeVisitRequest,
  ) => Promise<void>;
};

export default function RescheduleVisitModal({
  open,
  visit,
  onClose,
  onReschedule,
}: RescheduleVisitModalProps) {
  const [visitDate, setVisitDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !visit) {
      return;
    }

    setVisitDate(toDatetimeLocalValue(visit.visit_date));
    setSaving(false);
  }, [open, visit]);

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

    if (!visitDate) {
      toast.error("Informe a nova data e horário da visita.");
      return;
    }

    if (isDateTimeInPast(visitDate)) {
      toast.error("Escolha uma nova data e horário a partir de agora.");
      return;
    }

    try {
      setSaving(true);
      await onReschedule(visit.id, {
        visit_date: toApiDateTime(visitDate),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVisitDate(event.target.value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-visit-title"
    >
      <div className="grid max-h-[calc(100dvh-1rem)] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div>
            <h2
              id="reschedule-visit-title"
              className="caritas-mobile-safe pr-1 text-xl font-bold text-[var(--primary)] sm:text-2xl"
            >
              Reagendar visita
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Data atual: {formatDateTime(visit.visit_date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Fechar janela de reagendamento"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form
          id="reschedule-visit-form"
          onSubmit={handleSubmit}
          className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="reschedule-date"
              className="text-base font-bold text-slate-800"
            >
              Nova data e horário *
            </label>
            <input
              id="reschedule-date"
              type="datetime-local"
              value={visitDate}
              onChange={handleChange}
              min={getCurrentDatetimeLocalValue()}
              disabled={saving}
              className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 px-4 py-4 text-base leading-relaxed text-amber-950">
            A visita continuará como <strong>Visita marcada</strong>, mas com a
            nova data escolhida acima.
          </div>
        </form>

        <div className="grid gap-3 border-t border-slate-200 bg-white px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(15,23,42,0.08)] sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Voltar sem alterar
          </button>
          <button
            form="reschedule-visit-form"
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-xl bg-[var(--primary)] px-5 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            {saving ? "Salvando..." : "Salvar nova data"}
          </button>
        </div>
      </div>
    </div>
  );
}
