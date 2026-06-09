import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  History,
  Plus,
  RefreshCcw,
  Search,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getAuthSession, getSessionParish } from "../../api/auth";
import type { Family } from "../../types/types";
import {
  cancelHomeVisit,
  listFamiliesForHomeVisits,
  listHomeVisitsHistory,
  listRecentHomeVisits,
  rescheduleHomeVisit,
  saveVisitReport,
  scheduleHomeVisit,
} from "./api";
import CancelVisitModal from "./CancelVisitModal";
import RescheduleVisitModal from "./RescheduleVisitModal";
import ScheduleVisitModal from "./ScheduleVisitModal";
import type {
  HomeVisit,
  HomeVisitStatus,
  HomeVisitWithFamily,
  RescheduleHomeVisitRequest,
  VisitReportRequest,
  VisitScope,
} from "./types";
import {
  getApiErrorMessage,
  mergeHomeVisits,
  normalizeStatus,
  sortHomeVisitsForDisplay,
} from "./utils";
import VisitReportModal from "./VisitReportModal";
import VisitTable from "./VisitTable";

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
};

type ScopeOption = {
  value: VisitScope;
  title: string;
  description: string;
  icon: ReactNode;
};

function SummaryCard({ title, value, description, icon }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-slate-700">{title}</p>
          <p className="mt-2 text-4xl font-bold text-[var(--primary)]">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-[var(--primary)]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function getRejectedReason(results: PromiseSettledResult<HomeVisit[]>[]): unknown {
  return results.find((result) => result.status === "rejected")?.reason;
}

export default function VisitaDomiciliar() {
  const [visits, setVisits] = useState<HomeVisit[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<HomeVisitStatus | "all">(
    "all",
  );
  const [visitScope, setVisitScope] = useState<VisitScope>("mine");

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<HomeVisitWithFamily | null>(
    null,
  );

  const currentParish = getSessionParish();
  const session = getAuthSession();
  const currentUserId = session?.user.id;

  const visitsWithFamily = useMemo<HomeVisitWithFamily[]>(() => {
    const familyById = new Map(families.map((family) => [family.id, family]));

    return visits
      .map<HomeVisitWithFamily>((visit) => ({
        ...visit,
        family: visit.family ?? familyById.get(visit.family_id) ?? null,
        responsibleVisitor:
          visit.user ??
          (currentUserId === visit.user_id ? session?.user ?? null : null),
      }))
      .sort(sortHomeVisitsForDisplay);
  }, [visits, families, currentUserId, session]);

  const visibleVisits = useMemo<HomeVisitWithFamily[]>(() => {
    if (visitScope === "all" || !currentUserId) {
      return visitsWithFamily;
    }

    return visitsWithFamily.filter((visit) => visit.user_id === currentUserId);
  }, [currentUserId, visitScope, visitsWithFamily]);

  const summary = useMemo(() => {
    return visibleVisits.reduce(
      (totals, visit) => {
        const status = normalizeStatus(visit.status);

        totals.total += 1;

        if (status === "pending") {
          totals.pending += 1;
        }

        if (status === "completed") {
          totals.completed += 1;
        }

        if (status === "canceled") {
          totals.canceled += 1;
        }

        return totals;
      },
      {
        total: 0,
        pending: 0,
        completed: 0,
        canceled: 0,
      },
    );
  }, [visibleVisits]);

  const scopeOptions: ScopeOption[] = [
    {
      value: "mine",
      title: "Minhas visitas",
      description: "Mostra apenas as suas visitas.",
      icon: <UserRound className="h-6 w-6" />,
    },
    {
      value: "all",
      title: "Todas as visitas",
      description: "Mostra todas as visitas da paróquia.",
      icon: <UsersRound className="h-6 w-6" />,
    },
  ];

  const loadVisits = async () => {
    try {
      setLoadingVisits(true);
      const results = await Promise.allSettled([
        listRecentHomeVisits(),
        listHomeVisitsHistory(),
      ]);

      const loadedVisits = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );

      if (loadedVisits.length === 0) {
        const rejectedReason = getRejectedReason(results);

        if (rejectedReason) {
          throw rejectedReason;
        }
      }

      setVisits(mergeHomeVisits(loadedVisits));

      if (results.some((result) => result.status === "rejected")) {
        toast.error(
          "Algumas visitas não puderam ser carregadas, mas mostramos o que foi encontrado.",
        );
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Erro ao buscar visitas domiciliares."),
      );
    } finally {
      setLoadingVisits(false);
    }
  };

  const loadFamilies = async () => {
    if (!currentParish) {
      toast.error("Ocorreu um erro de sessão. Faça login novamente.");
      return;
    }

    try {
      setLoadingFamilies(true);
      const response = await listFamiliesForHomeVisits();
      setFamilies(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao buscar famílias."));
    } finally {
      setLoadingFamilies(false);
    }
  };

  const loadInitialData = async () => {
    await Promise.all([loadVisits(), loadFamilies()]);
  };

  useEffect(() => {
    void loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadInitialData();
    toast.success("Lista de visitas atualizada.");
  };

  const handleScheduleVisit = async (
    familyId: number,
    visitDate: string,
    notes: string | null,
  ) => {
    if (!session) {
      toast.error("Sessão não encontrada. Faça login novamente.");
      return;
    }

    try {
      await scheduleHomeVisit(familyId, {
        user_id: session.user.id,
        visit_date: visitDate,
        notes,
      });

      toast.success("Visita marcada com sucesso.");
      setVisitScope("mine");
      setScheduleModalOpen(false);
      await loadVisits();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao marcar visita."));
    }
  };

  const handleSaveReport = async (
    visitId: number,
    payload: VisitReportRequest,
  ) => {
    try {
      await saveVisitReport(visitId, payload);
      toast.success("Resultado da visita registrado com sucesso.");
      setReportModalOpen(false);
      setSelectedVisit(null);
      await loadVisits();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Erro ao registrar resultado da visita."),
      );
    }
  };

  const handleRescheduleVisit = async (
    visitId: number,
    payload: RescheduleHomeVisitRequest,
  ) => {
    try {
      await rescheduleHomeVisit(visitId, payload);
      toast.success("Visita reagendada com sucesso.");
      setRescheduleModalOpen(false);
      setSelectedVisit(null);
      await loadVisits();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao reagendar visita."));
    }
  };

  const handleCancelVisit = async (visitId: number) => {
    try {
      await cancelHomeVisit(visitId);
      toast.success("Visita cancelada com sucesso.");
      setCancelModalOpen(false);
      setSelectedVisit(null);
      await loadVisits();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao cancelar visita."));
    }
  };

  const openReportModal = (visit: HomeVisitWithFamily) => {
    setSelectedVisit(visit);
    setReportModalOpen(true);
  };

  const openRescheduleModal = (visit: HomeVisitWithFamily) => {
    setSelectedVisit(visit);
    setRescheduleModalOpen(true);
  };

  const openCancelModal = (visit: HomeVisitWithFamily) => {
    setSelectedVisit(visit);
    setCancelModalOpen(true);
  };

  const currentScopeLabel =
    visitScope === "mine" ? "minhas visitas" : "todas as visitas da paróquia";

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--primary)]">
            Visitas domiciliares
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingVisits || loadingFamilies}
            className="group flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-bold text-[var(--primary)] shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <RefreshCcw
              className={`h-5 w-5 transition-transform duration-200 ${
                loadingVisits || loadingFamilies
                  ? "animate-spin"
                  : "group-hover:rotate-90"
              }`}
            />
            Atualizar lista
          </button>

          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="group flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--chart-3)] px-5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--chart-3)]"
          >
            <Plus className="h-5 w-5" />
            Nova visita
          </button>
        </div>
      </div>

      <section
        aria-labelledby="visitas-escopo-titulo"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 id="visitas-escopo-titulo" className="text-xl font-bold text-slate-900">
          O que você quer ver?
        </h3>
        <p className="mt-1 text-base leading-relaxed text-slate-600">
          Comece por <strong>Minhas visitas</strong> para ver seu trabalho. Use
          <strong> Todas as visitas</strong> para acompanhar o que outros
          atendentes registraram na paróquia.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scopeOptions.map((option) => {
            const isSelected = option.value === visitScope;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setVisitScope(option.value)}
                aria-pressed={isSelected}
                className={`flex min-h-24 items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`rounded-xl p-3 ${
                    isSelected
                      ? "bg-[var(--primary)] text-white"
                      : "bg-slate-100 text-[var(--primary)]"
                  }`}
                  aria-hidden="true"
                >
                  {option.icon}
                </span>
                <span>
                  <span className="block text-lg font-bold text-slate-950">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-base leading-relaxed text-slate-600">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total"
          value={summary.total}
          description={`Total em ${currentScopeLabel}.`}
          icon={<History className="h-6 w-6" />}
        />
        <SummaryCard
          title="Marcadas"
          value={summary.pending}
          description="Visitas que ainda precisam ser feitas ou registradas."
          icon={<CalendarClock className="h-6 w-6" />}
        />
        <SummaryCard
          title="Realizadas"
          value={summary.completed}
          description="Visitas que já possuem resultado registrado."
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <SummaryCard
          title="Canceladas"
          value={summary.canceled}
          description="Visitas canceladas, mantidas apenas no histórico."
          icon={<XCircle className="h-6 w-6" />}
        />
      </div>

      <section
        aria-label="Filtros para encontrar visitas domiciliares"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-xl font-bold text-slate-900">Encontrar visitas</h3>
        <p className="mt-1 text-base text-slate-600">
          Use a busca ou escolha um status para localizar uma visita mais
          rapidamente.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-2">
            <label
              htmlFor="visit-search"
              className="text-base font-bold text-slate-800"
            >
              Buscar por família, responsável ou observação
            </label>
            <div className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                id="visit-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ex.: Família Silva ou cesta básica"
                className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="visit-status-filter"
              className="text-base font-bold text-slate-800"
            >
              Mostrar visitas
            </label>
            <select
              id="visit-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as HomeVisitStatus | "all")
              }
              className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Somente visitas marcadas</option>
              <option value="completed">Somente visitas realizadas</option>
              <option value="canceled">Somente visitas canceladas</option>
            </select>
          </div>
        </div>
      </section>

      <VisitTable
        visits={visibleVisits}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        loading={loadingVisits}
        emptyTitle={
          visitScope === "mine"
            ? "Nenhuma visita sua foi encontrada"
            : "Nenhuma visita foi encontrada"
        }
        emptyDescription={
          visitScope === "mine"
            ? "Você ainda não possui visitas neste filtro. Tente ver todas as visitas da paróquia ou marque uma nova visita."
            : "Não encontramos visitas com os filtros atuais. Você pode limpar a busca, mudar o status selecionado ou marcar uma nova visita."
        }
        listTitle={
          visitScope === "mine" ? "Minhas visitas" : "Todas as visitas da paróquia"
        }
        listDescription="Cada cartão representa uma visita. Use os botões para ver detalhes, registrar resultado, reagendar ou cancelar."
        onOpenReport={openReportModal}
        onOpenReschedule={openRescheduleModal}
        onOpenCancel={openCancelModal}
      />

      <ScheduleVisitModal
        open={scheduleModalOpen}
        responsibleName={session?.user.name ?? "Usuário logado"}
        responsibleEmail={session?.user.email}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleScheduleVisit}
      />

      <VisitReportModal
        open={reportModalOpen}
        visit={selectedVisit}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedVisit(null);
        }}
        onSave={handleSaveReport}
      />

      <RescheduleVisitModal
        open={rescheduleModalOpen}
        visit={selectedVisit}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedVisit(null);
        }}
        onReschedule={handleRescheduleVisit}
      />

      <CancelVisitModal
        open={cancelModalOpen}
        visit={selectedVisit}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedVisit(null);
        }}
        onCancelVisit={handleCancelVisit}
      />
    </div>
  );
}
