import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  Home,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  UsersRound,
  XCircle,
} from "lucide-react";

import { getAuthSession, getSessionParish } from "../../api/auth";
import { getInactiveFamilies, listFamilies } from "../../api/families";
import type { Family } from "../../types/types";
import {
  listHomeVisitsHistory,
  listRecentHomeVisits,
} from "../VisitaDomiciliar/api";
import type {
  HomeVisit,
  HomeVisitWithFamily,
} from "../VisitaDomiciliar/types";
import {
  formatDateTime,
  getFamilyName,
  getFamilyResponsibleName,
  mergeHomeVisits,
  normalizeStatus,
  parseVisitDate,
  sortHomeVisitsForDisplay,
} from "../VisitaDomiciliar/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type PainelGeralParoquiaProps = {
  onNavigate: (tabId: string) => void;
  canViewVisits?: boolean;
};

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallbackMessage;
}

function countFamilyMembers(family: Family): number {
  const memberIds = new Set<number>();

  if (family.responsible?.id) {
    memberIds.add(family.responsible.id);
  }

  family.assisted_family_members?.forEach((member) => {
    if (member.id) {
      memberIds.add(member.id);
    }
  });

  return Math.max(memberIds.size, family.assisted_family_members?.length ?? 0);
}

function SummaryCard({ title, value, description, icon }: SummaryCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
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
      </CardContent>
    </Card>
  );
}

export default function PainelGeralParoquia({
  onNavigate,
  canViewVisits = true,
}: PainelGeralParoquiaProps) {
  const session = getAuthSession();
  const parish = getSessionParish();

  const [families, setFamilies] = useState<Family[]>([]);
  const [inactiveFamilies, setInactiveFamilies] = useState<Family[]>([]);
  const [visits, setVisits] = useState<HomeVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const visitsWithFamily = useMemo<HomeVisitWithFamily[]>(() => {
    if (!canViewVisits) {
      return [];
    }

    const familyById = new Map(families.map((family) => [family.id, family]));

    return visits
      .map<HomeVisitWithFamily>((visit) => ({
        ...visit,
        family: visit.family ?? familyById.get(visit.family_id) ?? null,
        responsibleVisitor:
          visit.user ??
          (session?.user.id === visit.user_id ? session.user : null),
      }))
      .sort(sortHomeVisitsForDisplay);
  }, [canViewVisits, families, visits, session]);

  const dashboardData = useMemo(() => {
    const activeFamilies = families.filter((family) => family.is_active !== false);

    const totalMembers = activeFamilies.reduce(
      (total, family) => total + countFamilyMembers(family),
      0,
    );

    const visitTotals = visitsWithFamily.reduce(
      (totals, visit) => {
        const status = normalizeStatus(visit.status);

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
        pending: 0,
        completed: 0,
        canceled: 0,
      },
    );

    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const pendingVisits = visitsWithFamily.filter(
      (visit) => normalizeStatus(visit.status) === "pending",
    );

    const nextVisits = pendingVisits
      .filter((visit) => {
        const visitDate = parseVisitDate(visit.visit_date);
        return visitDate ? visitDate.getTime() >= now : false;
      })
      .sort((firstVisit, secondVisit) => {
        const firstDate = parseVisitDate(firstVisit.visit_date)?.getTime() ?? 0;
        const secondDate = parseVisitDate(secondVisit.visit_date)?.getTime() ?? 0;
        return firstDate - secondDate;
      })
      .slice(0, 5);

    const overdueVisits = pendingVisits.filter((visit) => {
      const visitDate = parseVisitDate(visit.visit_date);
      return visitDate ? visitDate.getTime() < startOfToday.getTime() : false;
    });

    const recentFamilies = [...activeFamilies]
      .sort((firstFamily, secondFamily) => secondFamily.id - firstFamily.id)
      .slice(0, 4);

    return {
      activeFamilies,
      totalMembers,
      visitTotals,
      nextVisits,
      overdueVisits,
      recentFamilies,
    };
  }, [families, visitsWithFamily]);

  const loadDashboard = async (showRefreshingState = false) => {
    if (!parish) {
      setErrorMessage("Não foi possível identificar a paróquia da sessão.");
      setLoading(false);
      return;
    }

    try {
      setErrorMessage(null);
      setWarningMessage(null);

      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        familiesResult,
        inactiveFamiliesResult,
        recentVisitsResult,
        historyVisitsResult,
      ] = await Promise.allSettled([
        listFamilies(false),
        getInactiveFamilies(false),
        canViewVisits ? listRecentHomeVisits() : Promise.resolve([]),
        canViewVisits ? listHomeVisitsHistory() : Promise.resolve([]),
      ]);

      const failedSections: string[] = [];

      if (familiesResult.status === "fulfilled") {
        setFamilies(familiesResult.value);
      } else {
        failedSections.push("famílias");
      }

      if (inactiveFamiliesResult.status === "fulfilled") {
        setInactiveFamilies(inactiveFamiliesResult.value);
      } else {
        failedSections.push("famílias desativadas");
      }

      if (canViewVisits) {
        const loadedVisits = [
          recentVisitsResult.status === "fulfilled"
            ? recentVisitsResult.value
            : [],
          historyVisitsResult.status === "fulfilled"
            ? historyVisitsResult.value
            : [],
        ].flat();

        if (
          recentVisitsResult.status === "rejected" &&
          historyVisitsResult.status === "rejected"
        ) {
          failedSections.push("visitas");
        }

        setVisits(mergeHomeVisits(loadedVisits));
      } else {
        setVisits([]);
      }

      if (
        familiesResult.status === "rejected" &&
        (!canViewVisits ||
          (recentVisitsResult.status === "rejected" &&
            historyVisitsResult.status === "rejected"))
      ) {
        throw familiesResult.reason;
      }

      if (failedSections.length > 0) {
        setWarningMessage(
          `Algumas informações não puderam ser carregadas agora: ${failedSections.join(
            ", ",
          )}. O painel exibirá o que foi encontrado.`,
        );
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível carregar o painel da paróquia.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasNoData =
    !loading &&
    dashboardData.activeFamilies.length === 0 &&
    (!canViewVisits || visitsWithFamily.length === 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>

            <h2 className="text-3xl font-bold text-[var(--primary)]">
              Olá, {session?.user.name ?? "bem-vindo(a)"}!
            </h2>

            <p className="mt-2 max-w-3xl text-lg leading-relaxed text-slate-700">
              Aqui estão as principais informações da{" "}
              <strong>{parish?.name ?? "sua paróquia"}</strong> para ajudar no
              acompanhamento das famílias{canViewVisits ? " e visitas" : ""}.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            className="w-full lg:w-auto"
          >
            {refreshing ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
            )}
            {refreshing ? "Atualizando..." : "Atualizar dados"}
          </Button>
        </div>
      </section>

      {loading ? (
        <section
          className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
          aria-live="polite"
        >
          <Loader2
            className="mx-auto h-10 w-10 animate-spin text-[var(--primary)]"
            aria-hidden="true"
          />
          <h3 className="mt-4 text-xl font-bold text-slate-900">
            Carregando painel da paróquia
          </h3>
          <p className="mt-2 text-base text-slate-600">
            Buscando famílias, membros cadastrados
            {canViewVisits ? " e visitas domiciliares" : ""}.
          </p>
        </section>
      ) : null}

      {errorMessage ? (
        <section
          className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 shadow-sm"
          role="alert"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-1 h-6 w-6 flex-shrink-0 text-red-700"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xl font-bold text-red-900">
                  Não foi possível carregar o painel
                </h3>
                <p className="mt-1 text-base leading-relaxed text-red-800">
                  {errorMessage}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={() => void loadDashboard(true)}
            >
              Tentar novamente
            </Button>
          </div>
        </section>
      ) : null}

      {warningMessage && !errorMessage ? (
        <section
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          role="status"
        >
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-1 h-5 w-5 flex-shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p className="text-base leading-relaxed text-amber-900">
              {warningMessage}
            </p>
          </div>
        </section>
      ) : null}

      {!loading ? (
        <>
          <section
            className={`grid gap-4 sm:grid-cols-2 ${
              canViewVisits ? "xl:grid-cols-5" : "xl:grid-cols-2"
            }`}
            aria-label="Resumo da paróquia"
          >
            <SummaryCard
              title="Famílias ativas"
              value={dashboardData.activeFamilies.length}
              description="Núcleos familiares acompanhados pela paróquia."
              icon={<UsersRound className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Pessoas cadastradas"
              value={dashboardData.totalMembers}
              description="Responsáveis e membros vinculados às famílias."
              icon={<Home className="h-7 w-7" aria-hidden="true" />}
            />

            {canViewVisits && (
              <>
                <SummaryCard
                  title="Visitas marcadas"
                  value={dashboardData.visitTotals.pending}
                  description="Visitas ainda pendentes de realização."
                  icon={
                    <CalendarClock className="h-7 w-7" aria-hidden="true" />
                  }
                />

                <SummaryCard
                  title="Visitas realizadas"
                  value={dashboardData.visitTotals.completed}
                  description="Visitas já registradas como concluídas."
                  icon={<CheckCircle className="h-7 w-7" aria-hidden="true" />}
                />

                <SummaryCard
                  title="Visitas canceladas"
                  value={dashboardData.visitTotals.canceled}
                  description="Visitas canceladas no histórico da paróquia."
                  icon={<XCircle className="h-7 w-7" aria-hidden="true" />}
                />
              </>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Ações rápidas
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => onNavigate("nucleos")}
                  className="min-h-16 justify-start text-left"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Cadastrar núcleo familiar
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("nucleos")}
                  className="min-h-16 justify-start text-left"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Consultar famílias
                </Button>

                {canViewVisits && (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => onNavigate("visitas")}
                      className="min-h-16 justify-start text-left"
                    >
                      <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                      Agendar visita
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => onNavigate("visitas")}
                      className="min-h-16 justify-start text-left"
                    >
                      <ClipboardList className="h-5 w-5" aria-hidden="true" />
                      Ver visitas domiciliares
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Avisos importantes
                </CardTitle>
                <CardDescription className="text-base">
                  Pontos que merecem atenção da equipe.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {canViewVisits &&
                  (dashboardData.overdueVisits.length > 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="font-bold text-amber-900">
                        {dashboardData.overdueVisits.length} visita(s)
                        marcada(s) com data passada.
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-amber-800">
                        Verifique se a visita foi realizada, cancelada ou
                        precisa ser reagendada.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="font-bold text-emerald-900">
                        Nenhuma visita vencida encontrada.
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                        As visitas marcadas estão sem pendências de data
                        passada.
                      </p>
                    </div>
                  ))}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">POSTERIORMENTE</Badge>
                    <p className="font-bold text-slate-900">
                      Benefícios e estoque
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    USO POSTERIOR
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {canViewVisits && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900">
                        Próximas visitas
                      </CardTitle>
                      <CardDescription className="text-base">
                        Visitas marcadas para os próximos dias.
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onNavigate("visitas")}
                    >
                      Ver todas
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {dashboardData.nextVisits.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.nextVisits.map((visit) => (
                        <article
                          key={visit.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {getFamilyName(visit)}
                              </h3>
                              <p className="mt-1 text-base text-slate-700">
                                Responsável familiar:{" "}
                                <strong>
                                  {getFamilyResponsibleName(visit)}
                                </strong>
                              </p>
                            </div>

                            <Badge variant="outline" className="text-sm">
                              Visita marcada
                            </Badge>
                          </div>

                          <p className="mt-3 text-base font-semibold text-[var(--primary)]">
                            {formatDateTime(visit.visit_date)}
                          </p>

                          {visit.notes ? (
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                              {visit.notes}
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <CalendarClock
                        className="mx-auto h-10 w-10 text-slate-400"
                        aria-hidden="true"
                      />
                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        Nenhuma próxima visita marcada
                      </h3>
                      <p className="mt-1 text-base text-slate-600">
                        Use a ação rápida “Agendar visita” para criar um novo
                        agendamento.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Resumo das famílias
                </CardTitle>
                <CardDescription className="text-base">
                  Situação geral dos núcleos familiares.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold uppercase text-slate-500">
                      Ativas
                    </p>
                    <p className="mt-1 text-3xl font-bold text-[var(--primary)]">
                      {dashboardData.activeFamilies.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold uppercase text-slate-500">
                      Desativadas
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-800">
                      {inactiveFamilies.length}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Últimos núcleos cadastrados
                  </h3>

                  {dashboardData.recentFamilies.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {dashboardData.recentFamilies.map((family) => (
                        <article
                          key={family.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <p className="font-bold text-slate-900">
                            {family.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Responsável:{" "}
                            <strong>{family.responsible?.name ?? "Não informado"}</strong>
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Membros cadastrados: {countFamilyMembers(family)}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-base text-slate-600">
                      Nenhum núcleo familiar ativo foi encontrado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {hasNoData ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <UsersRound
                className="mx-auto h-12 w-12 text-slate-400"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Ainda não há dados para mostrar
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
                Quando a paróquia cadastrar famílias
                {canViewVisits ? " ou agendar visitas" : ""}, os números
                principais aparecerão automaticamente neste painel.
              </p>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
