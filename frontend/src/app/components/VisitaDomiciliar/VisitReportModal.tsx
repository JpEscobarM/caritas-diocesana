import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import type { HomeVisitWithFamily, VisitReportRequest } from "./types";
import {
  formatDateTime,
  getCurrentDatetimeLocalValue,
  isDateTimeInPast,
  toApiDateTime,
  toDatetimeLocalValue,
} from "./utils";

type VisitReportModalProps = {
  open: boolean;
  visit: HomeVisitWithFamily | null;
  onClose: () => void;
  onSave: (visitId: number, payload: VisitReportRequest) => Promise<void>;
};

type ReportForm = {
  notes: string;
  forwarding: string;
  nextVisitDate: string;
};

const initialForm: ReportForm = {
  notes: "",
  forwarding: "",
  nextVisitDate: "",
};

export default function VisitReportModal({
  open,
  visit,
  onClose,
  onSave,
}: VisitReportModalProps) {
  const [form, setForm] = useState<ReportForm>(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !visit) {
      return;
    }

    setForm({
      notes: visit.notes ?? "",
      forwarding: visit.forwarding ?? "",
      nextVisitDate: toDatetimeLocalValue(visit.next_visit_date),
    });
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

  const handleChange =
    (field: keyof ReportForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.notes.trim()) {
      toast.error("Informe as observações da visita.");
      return;
    }

    if (form.nextVisitDate && isDateTimeInPast(form.nextVisitDate)) {
      toast.error("A próxima visita precisa ter uma data a partir de agora.");
      return;
    }

    const payload: VisitReportRequest = {
      notes: form.notes.trim(),
      forwarding: form.forwarding.trim() || null,
      next_visit_date: form.nextVisitDate
        ? toApiDateTime(form.nextVisitDate)
        : null,
      status: "completed",
    };

    try {
      setSaving(true);
      await onSave(visit.id, payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-report-title"
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="visit-report-title"
              className="text-2xl font-bold text-[var(--primary)]"
            >
              Registrar resultado da visita
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              {visit.family?.name ?? `Família #${visit.family_id}`} — visita de {formatDateTime(visit.visit_date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Fechar janela de registro da visita"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-2">
            <label
              htmlFor="visit-notes"
              className="text-base font-bold text-slate-800"
            >
              Observações da visita *
            </label>
            <textarea
              id="visit-notes"
              value={form.notes}
              onChange={handleChange("notes")}
              disabled={saving}
              rows={4}
              placeholder="Ex.: Família necessita de cesta básica, roupas infantis e acompanhamento social."
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="visit-forwarding"
              className="text-base font-bold text-slate-800"
            >
              Encaminhamento, se houver
            </label>
            <textarea
              id="visit-forwarding"
              value={form.forwarding}
              onChange={handleChange("forwarding")}
              disabled={saving}
              rows={2}
              placeholder="Ex.: Encaminhar para próxima entrega mensal."
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="next-visit-date"
              className="text-base font-bold text-slate-800"
            >
              Próxima visita, se necessário
            </label>
            <input
              id="next-visit-date"
              type="datetime-local"
              value={form.nextVisitDate}
              onChange={handleChange("nextVisitDate")}
              min={getCurrentDatetimeLocalValue()}
              disabled={saving}
              className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50 px-4 py-4 text-base leading-relaxed text-emerald-950">
            Ao salvar, a visita será marcada como <strong>Visita realizada</strong> e continuará no histórico da família.
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 -mb-4 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Voltar sem salvar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 rounded-xl bg-[var(--primary)] px-5 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {saving ? "Salvando..." : "Salvar resultado da visita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
