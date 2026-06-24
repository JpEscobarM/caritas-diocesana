import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  UserRound,
} from "lucide-react";

import type { HomeVisitStatus, HomeVisitWithFamily } from "./types";
import {
  filterHomeVisitsForDisplay,
  formatTimeOnly,
  getFamilyName,
  getFamilyResponsibleName,
  getVisitDateKey,
  isVisitStatus,
  normalizeStatus,
  parseVisitDate,
} from "./utils";
import VisitStatusBadge from "./VisitStatusBadge";

type VisitCalendarViewProps = {
  visits: HomeVisitWithFamily[];
  searchTerm: string;
  statusFilter: HomeVisitStatus | "all";
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  agendaTitle?: string;
  agendaDescription?: string;
  onOpenReport: (visit: HomeVisitWithFamily) => void;
  onOpenReschedule: (visit: HomeVisitWithFamily) => void;
  onOpenCancel: (visit: HomeVisitWithFamily) => void;
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getDateKeyFromDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function isSameMonth(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  );
}

function getCalendarDays(month: Date): Date[] {
  const firstDayOfMonth = startOfMonth(month);
  const firstCalendarDay = new Date(firstDayOfMonth);
  firstCalendarDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  const days: Date[] = [];
  const currentDay = new Date(firstCalendarDay);

  for (let index = 0; index < 42; index += 1) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return days;
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function getStatusCalendarClassName(status: HomeVisitWithFamily["status"]): string {
  switch (normalizeStatus(status)) {
    case "pending":
      return "border-amber-400 bg-amber-50";
    case "completed":
      return "border-emerald-500 bg-emerald-50";
    case "canceled":
      return "border-slate-400 bg-slate-50 opacity-80";
    default:
      return "border-rose-400 bg-rose-50";
  }
}

function VisitAgendaCard({
  visit,
  onOpenReport,
  onOpenReschedule,
  onOpenCancel,
}: {
  visit: HomeVisitWithFamily;
  onOpenReport: (visit: HomeVisitWithFamily) => void;
  onOpenReschedule: (visit: HomeVisitWithFamily) => void;
  onOpenCancel: (visit: HomeVisitWithFamily) => void;
}) {
  const isPending = isVisitStatus(visit.status, "pending");
  const isCanceled = isVisitStatus(visit.status, "canceled");
  const isCompleted = isVisitStatus(visit.status, "completed");

  return (
    <article
      className={`rounded-xl border-l-4 p-3 shadow-sm ${getStatusCalendarClassName(
        visit.status,
      )}`}
      aria-label={`Visita de ${getFamilyName(visit)} em ${formatTimeOnly(
        visit.visit_date,
      )}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {formatTimeOnly(visit.visit_date)}
        </div>
        <VisitStatusBadge status={visit.status} />
      </div>

      <div className="mt-3 space-y-2">
        <p className="flex items-start gap-2 text-base font-bold leading-snug text-slate-950">
          <Home className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
          <span>{getFamilyName(visit)}</span>
        </p>

        <p className="flex items-start gap-2 text-sm leading-snug text-slate-700">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span>Responsável: {getFamilyResponsibleName(visit)}</span>
        </p>
      </div>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => onOpenReport(visit)}
          disabled={isCanceled}
          className="min-h-10 rounded-lg bg-emerald-700 px-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          {isCompleted ? "Ver/editar resultado" : "Registrar resultado"}
        </button>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenReschedule(visit)}
            disabled={!isPending}
            className="min-h-10 rounded-lg bg-amber-700 px-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          >
            Reagendar
          </button>

          <button
            type="button"
            onClick={() => onOpenCancel(visit)}
            disabled={!isPending}
            className="min-h-10 rounded-lg bg-slate-700 px-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </article>
  );
}

export default function VisitCalendarView({
  visits,
  searchTerm,
  statusFilter,
  loading = false,
  emptyTitle = "Nenhuma visita encontrada",
  emptyDescription = "Não encontramos visitas com os filtros atuais. Você pode limpar a busca, mudar o status selecionado ou agendar uma nova visita.",
  agendaTitle = "Agenda de visitas",
  agendaDescription = "As visitas aparecem agrupadas por dia. Use as setas para navegar entre os meses.",
  onOpenReport,
  onOpenReschedule,
  onOpenCancel,
}: VisitCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [monthInitialized, setMonthInitialized] = useState(false);

  const filteredVisits = useMemo(
    () => filterHomeVisitsForDisplay(visits, searchTerm, statusFilter),
    [visits, searchTerm, statusFilter],
  );

  useEffect(() => {
    if (monthInitialized || filteredVisits.length === 0) {
      return;
    }

    const firstPendingVisit = filteredVisits.find((visit) =>
      isVisitStatus(visit.status, "pending"),
    );
    const firstVisitDate = parseVisitDate(
      (firstPendingVisit ?? filteredVisits[0]).visit_date,
    );

    if (firstVisitDate) {
      setCurrentMonth(startOfMonth(firstVisitDate));
    }

    setMonthInitialized(true);
  }, [filteredVisits, monthInitialized]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const visitsByDate = useMemo(() => {
    const groupedVisits = new Map<string, HomeVisitWithFamily[]>();

    filteredVisits.forEach((visit) => {
      const dateKey = getVisitDateKey(visit.visit_date);

      if (!dateKey) {
        return;
      }

      const visitsFromDay = groupedVisits.get(dateKey) ?? [];
      visitsFromDay.push(visit);
      groupedVisits.set(dateKey, visitsFromDay);
    });

    groupedVisits.forEach((visitsFromDay, dateKey) => {
      groupedVisits.set(
        dateKey,
        visitsFromDay.sort((firstVisit, secondVisit) => {
          const firstDate = parseVisitDate(firstVisit.visit_date)?.getTime() ?? 0;
          const secondDate = parseVisitDate(secondVisit.visit_date)?.getTime() ?? 0;

          return firstDate - secondDate;
        }),
      );
    });

    return groupedVisits;
  }, [filteredVisits]);

  const monthVisitsByDay = useMemo(() => {
    return Array.from(visitsByDate.entries())
      .map(([dateKey, visitsFromDay]) => {
        const firstVisitDate = parseVisitDate(visitsFromDay[0]?.visit_date);

        return {
          dateKey,
          date: firstVisitDate,
          visits: visitsFromDay,
        };
      })
      .filter((dayGroup) => dayGroup.date && isSameMonth(dayGroup.date, currentMonth))
      .sort((firstGroup, secondGroup) => {
        const firstDate = firstGroup.date?.getTime() ?? 0;
        const secondDate = secondGroup.date?.getTime() ?? 0;

        return firstDate - secondDate;
      });
  }, [currentMonth, visitsByDate]);

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => addMonths(month, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => addMonths(month, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-bold text-slate-800">
          Carregando agenda de visitas...
        </p>
        <p className="mt-2 text-base text-slate-600">
          Aguarde enquanto organizamos as visitas por data.
        </p>
      </div>
    );
  }

  if (filteredVisits.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center shadow-sm sm:p-8">
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
      aria-labelledby="visitas-agenda-titulo"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 id="visitas-agenda-titulo" className="text-xl font-bold text-slate-900">
              {agendaTitle}
            </h3>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              {agendaDescription}
            </p>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goToCurrentMonth}
              className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Hoje
            </button>

            <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border-2 border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-700 transition-all hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <p className="min-w-0 flex-1 text-center text-base font-bold capitalize text-slate-900 sm:min-w-44" aria-live="polite">
                {formatMonthLabel(currentMonth)}
              </p>

              <button
                type="button"
                onClick={goToNextMonth}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-700 transition-all hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wide text-slate-700"
              >
                {weekDay}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = getDateKeyFromDate(day);
              const visitsFromDay = isSameMonth(day, currentMonth)
                ? visitsByDate.get(dateKey) ?? []
                : [];
              const isToday = dateKey === getDateKeyFromDate(new Date());

              return (
                <div
                  key={dateKey}
                  className={`min-h-52 border-b border-r border-slate-200 p-2 ${
                    isSameMonth(day, currentMonth) ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isToday
                          ? "bg-[var(--primary)] text-white"
                          : isSameMonth(day, currentMonth)
                            ? "text-slate-900"
                            : "text-slate-400"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {visitsFromDay.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                        {visitsFromDay.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {visitsFromDay.map((visit) => (
                      <VisitAgendaCard
                        key={visit.id}
                        visit={visit}
                        onOpenReport={onOpenReport}
                        onOpenReschedule={onOpenReschedule}
                        onOpenCancel={onOpenCancel}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          {monthVisitsByDay.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-6">
              <p className="text-lg font-bold text-slate-900">
                Nenhuma visita neste mês
              </p>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Use as setas para mudar o mês ou ajuste os filtros acima.
              </p>
            </div>
          ) : (
            monthVisitsByDay.map((dayGroup) => (
              <section
                key={dayGroup.dateKey}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                aria-labelledby={`agenda-dia-${dayGroup.dateKey}`}
              >
                <h4
                  id={`agenda-dia-${dayGroup.dateKey}`}
                  className="text-lg font-bold capitalize text-slate-950"
                >
                  {dayGroup.date ? formatDayLabel(dayGroup.date) : "Data não informada"}
                </h4>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {dayGroup.visits.length} visita(s) neste dia
                </p>

                <div className="mt-3 space-y-3">
                  {dayGroup.visits.map((visit) => (
                    <VisitAgendaCard
                      key={visit.id}
                      visit={visit}
                      onOpenReport={onOpenReport}
                      onOpenReschedule={onOpenReschedule}
                      onOpenCancel={onOpenCancel}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
