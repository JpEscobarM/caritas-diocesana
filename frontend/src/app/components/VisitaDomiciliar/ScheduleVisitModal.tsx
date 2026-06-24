import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import type { Family } from "../../types/types";
import { searchFamiliesForHomeVisits } from "./api";
import {
  getApiErrorMessage,
  getCurrentDatetimeLocalValue,
  isDateTimeInPast,
  toApiDateTime,
} from "./utils";

type ScheduleVisitModalProps = {
  open: boolean;
  responsibleName: string;
  responsibleEmail?: string;
  onClose: () => void;
  onSchedule: (
    familyId: number,
    visitDate: string,
    notes: string | null,
  ) => Promise<void>;
};

type ScheduleForm = {
  visitDate: string;
  notes: string;
};

const initialForm: ScheduleForm = {
  visitDate: "",
  notes: "",
};

function getFamilyLabel(family: Family): string {
  const responsibleName =
    family.responsible?.name ?? "responsável não informado";
  return `${family.name} — responsável familiar: ${responsibleName}`;
}

function getFamilySearchHelperText(searchTerm: string): string {
  if (searchTerm.trim().length < 2) {
    return "Digite pelo menos 2 letras do nome da família ou do responsável familiar.";
  }

  return "Clique ou toque em uma família encontrada para selecionar.";
}

export default function ScheduleVisitModal({
  open,
  responsibleName,
  responsibleEmail,
  onClose,
  onSchedule,
}: ScheduleVisitModalProps) {
  const [form, setForm] = useState<ScheduleForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState("");
  const [familyResults, setFamilyResults] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [searchingFamilies, setSearchingFamilies] = useState(false);
  const [familySearchTouched, setFamilySearchTouched] = useState(false);

  const canSearchFamilies = useMemo(
    () => familySearchTerm.trim().length >= 2,
    [familySearchTerm],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialForm);
    setSaving(false);
    setFamilySearchTerm("");
    setFamilyResults([]);
    setSelectedFamily(null);
    setSearchingFamilies(false);
    setFamilySearchTouched(false);
  }, [open]);

  useEffect(() => {
    if (!open || selectedFamily) {
      return;
    }

    if (!canSearchFamilies) {
      setFamilyResults([]);
      setSearchingFamilies(false);
      return;
    }

    let ignoreResult = false;

    const searchTimeout = window.setTimeout(async () => {
      try {
        setSearchingFamilies(true);
        const results = await searchFamiliesForHomeVisits(familySearchTerm);

        if (!ignoreResult) {
          setFamilyResults(results.slice(0, 8));
        }
      } catch (error) {
        if (!ignoreResult) {
          toast.error(
            getApiErrorMessage(
              error,
              "Erro ao buscar famílias para agendamento.",
            ),
          );
          setFamilyResults([]);
        }
      } finally {
        if (!ignoreResult) {
          setSearchingFamilies(false);
        }
      }
    }, 350);

    return () => {
      ignoreResult = true;
      window.clearTimeout(searchTimeout);
    };
  }, [canSearchFamilies, familySearchTerm, open, selectedFamily]);

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

  if (!open) {
    return null;
  }

  const handleFieldChange =
    (field: keyof ScheduleForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleFamilySearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFamilySearchTerm(event.target.value);
    setSelectedFamily(null);
    setFamilySearchTouched(true);
  };

  const handleSelectFamily = (family: Family) => {
    setSelectedFamily(family);
    setFamilySearchTerm(getFamilyLabel(family));
    setFamilyResults([]);
    setFamilySearchTouched(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFamily) {
      toast.error("Busque e selecione a família que receberá a visita.");
      return;
    }

    if (!form.visitDate) {
      toast.error("Informe a data e o horário da visita.");
      return;
    }

    if (isDateTimeInPast(form.visitDate)) {
      toast.error("Escolha uma data e horário a partir de agora.");
      return;
    }

    try {
      setSaving(true);
      await onSchedule(
        selectedFamily.id,
        toApiDateTime(form.visitDate),
        form.notes.trim() || null,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-visit-title"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:gap-4 sm:px-6">
          <div>
            <h2
              id="schedule-visit-title"
              className="caritas-mobile-safe pr-1 text-xl font-bold text-[var(--primary)] sm:text-2xl"
            >
              Nova visita
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Escolha a família, informe a data e salve.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            aria-label="Fechar janela de agendamento"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="visit-family-search"
              className="text-base font-bold text-slate-800"
            >
              Família que será visitada *
            </label>

            <div className="relative">
              <div className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20">
                <Search className="h-5 w-5 shrink-0 text-slate-500" />
                <input
                  id="visit-family-search"
                  type="search"
                  value={familySearchTerm}
                  onChange={handleFamilySearchChange}
                  disabled={saving}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={familyResults.length > 0}
                  aria-controls="visit-family-search-results"
                  aria-autocomplete="list"
                  placeholder="Ex.: Davi, Silva..."
                  className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                />
                {searchingFamilies && (
                  <Loader2
                    className="h-5 w-5 shrink-0 animate-spin text-slate-500"
                    aria-hidden="true"
                  />
                )}
              </div>

              {familyResults.length > 0 && !selectedFamily && (
                <div
                  id="visit-family-search-results"
                  role="listbox"
                  aria-label="Famílias encontradas para agendamento"
                  className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border-2 border-slate-200 bg-white p-2 shadow-xl"
                >
                  {familyResults.map((family) => (
                    <button
                      key={family.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectFamily(family)}
                      className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      <span className="block text-base font-bold text-slate-950">
                        {family.name}
                      </span>
                      <span className="mt-1 block text-sm text-slate-700">
                        Responsável familiar:{" "}
                        {family.responsible?.name ?? "não informado"}
                      </span>
                      {family.address && (
                        <span className="mt-1 block text-sm text-slate-600">
                          Endereço: {family.address}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-base text-slate-600">
              {getFamilySearchHelperText(familySearchTerm)}
            </p>

            {familySearchTouched &&
              canSearchFamilies &&
              !searchingFamilies &&
              familyResults.length === 0 &&
              !selectedFamily && (
                <p className="rounded-xl border-2 border-amber-100 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-950">
                  Nenhuma família ativa foi encontrada com esse texto. Confira a
                  grafia ou tente buscar pelo nome do responsável familiar.
                </p>
              )}

            {selectedFamily && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-emerald-100 bg-emerald-50 px-4 py-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-base font-bold text-emerald-950">
                    Família selecionada
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-emerald-950">
                    {getFamilyLabel(selectedFamily)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-base font-bold text-slate-800">
              Atendente responsável pela visita
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {responsibleName}
            </p>
            {responsibleEmail && (
              <p className="mt-0.5 text-base text-slate-700">
                {responsibleEmail}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="visit-date"
              className="text-base font-bold text-slate-800"
            >
              Data e horário da visita *
            </label>
            <input
              id="visit-date"
              type="datetime-local"
              value={form.visitDate}
              onChange={handleFieldChange("visitDate")}
              min={getCurrentDatetimeLocalValue()}
              disabled={saving}
              className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 -mb-4 grid gap-3 border-t border-slate-200 bg-white px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:-mx-6 sm:flex sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Voltar sem agendar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 rounded-xl bg-[var(--primary)] px-5 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {saving ? "Salvando..." : "Salvar visita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
