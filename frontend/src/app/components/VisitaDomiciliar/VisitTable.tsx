import { useMemo, useState } from "react";
import { CalendarClock, ChevronDown, ChevronUp } from "lucide-react";

import type { HomeVisitStatus, HomeVisitWithFamily } from "./types";
import {
  filterHomeVisitsForDisplay,
  formatDateOnly,
  formatDateTime,
  getFamilyName,
  getFamilyResponsibleName,
  getResponsibleVisitorName,
  isVisitStatus,
} from "./utils";
import VisitStatusBadge from "./VisitStatusBadge";

type VisitTableProps = {
  visits: HomeVisitWithFamily[];
  searchTerm: string;
  statusFilter: HomeVisitStatus | "all";
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  listTitle?: string;
  listDescription?: string;
  onOpenReport: (visit: HomeVisitWithFamily) => void;
  onOpenReschedule: (visit: HomeVisitWithFamily) => void;
  onOpenCancel: (visit: HomeVisitWithFamily) => void;
};

export default function VisitTable({
  visits,
  searchTerm,
  statusFilter,
  loading = false,
  emptyTitle = "Nenhuma visita encontrada",
  emptyDescription = "Não encontramos visitas com os filtros atuais. Você pode limpar a busca, mudar o status selecionado ou agendar uma nova visita.",
  listTitle = "Lista de visitas da paróquia",
  listDescription = "Cada cartão abaixo representa uma visita. Use os botões no final do cartão para registrar, reagendar ou cancelar.",
  onOpenReport,
  onOpenReschedule,
  onOpenCancel,
}: VisitTableProps) {
  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);

  const filteredVisits = useMemo(
    () => filterHomeVisitsForDisplay(visits, searchTerm, statusFilter),
    [visits, searchTerm, statusFilter],
  );

  const toggleExpandedVisit = (visitId: number) => {
    setExpandedVisitId((current) => (current === visitId ? null : visitId));
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-bold text-slate-800">
          Carregando visitas domiciliares...
        </p>
        <p className="mt-2 text-base text-slate-600">
          Aguarde enquanto buscamos as visitas da paróquia.
        </p>
      </div>
    );
  }

  if (filteredVisits.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <CalendarClock className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {emptyTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="visitas-lista-titulo"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h3 id="visitas-lista-titulo" className="text-xl font-bold text-slate-900">
          {listTitle}
        </h3>
        <p className="mt-1 text-base text-slate-600">
          {listDescription}
        </p>
      </div>

      <div className="space-y-4 p-4">
        {filteredVisits.map((visit) => {
          const isExpanded = expandedVisitId === visit.id;
          const isPending = isVisitStatus(visit.status, "pending");
          const isCanceled = isVisitStatus(visit.status, "canceled");
          const isCompleted = isVisitStatus(visit.status, "completed");

          return (
            <article
              key={visit.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
              aria-labelledby={`visita-${visit.id}-titulo`}
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Família visitada
                  </p>
                  <h4
                    id={`visita-${visit.id}-titulo`}
                    className="mt-1 text-xl font-bold text-slate-950"
                  >
                    {getFamilyName(visit)}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <VisitStatusBadge status={visit.status} />
                </div>
              </div>

              <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    Responsável pela família
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {getFamilyResponsibleName(visit)}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    Atendente responsável
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {getResponsibleVisitorName(visit)}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    Data e horário
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {formatDateTime(visit.visit_date)}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    Próxima visita
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {formatDateOnly(visit.next_visit_date)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-base font-bold text-slate-900">
                  O que fazer com esta visita?
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => toggleExpandedVisit(visit.id)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    aria-expanded={isExpanded}
                    aria-controls={`visita-${visit.id}-detalhes`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                    {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenReport(visit)}
                    disabled={isCanceled}
                    title={
                      isCanceled
                        ? "Visitas canceladas não podem receber resultado."
                        : isCompleted
                          ? "Ver ou corrigir as observações já registradas."
                          : "Registrar observações e encaminhamentos da visita."
                    }
                    className="min-h-12 rounded-xl bg-emerald-700 px-4 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  >
                    {isCompleted ? "Ver/editar resultado" : "Registrar resultado"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenReschedule(visit)}
                    disabled={!isPending}
                    title={
                      isPending
                        ? "Alterar data e horário desta visita."
                        : "Somente visitas marcadas podem ser reagendadas."
                    }
                    className="min-h-12 rounded-xl bg-amber-700 px-4 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                  >
                    Reagendar
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCancel(visit)}
                    disabled={!isPending}
                    title={
                      isPending
                        ? "Marcar esta visita como cancelada."
                        : "Somente visitas marcadas podem ser canceladas."
                    }
                    className="min-h-12 rounded-xl bg-slate-700 px-4 text-base font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div
                  id={`visita-${visit.id}-detalhes`}
                  className="mt-4 grid gap-4 lg:grid-cols-2"
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                      Observações da visita
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                      {visit.notes || "Nenhuma observação registrada."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                      Encaminhamento
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                      {visit.forwarding || "Nenhum encaminhamento registrado."}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
