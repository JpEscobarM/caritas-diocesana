import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle,
  Church,
  ClipboardList,
  Loader2,
  Package,
  RefreshCcw,
  ShoppingBag,
  UsersRound,
  XCircle,
} from "lucide-react";

import { getAuthSession } from "../../api/auth";
import {
  listDioceseFamilies,
  listDioceseHomeVisitsHistory,
  listDioceseInactiveFamilies,
  listDioceseParishes,
  listDioceseRecentHomeVisits,
} from "../../api/dioceseDashboard";
import type { Family, Parish } from "../../types/types";
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

type PainelGeralDioceseProps = {
  onNavigate: (tabId: string) => void;
};

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
};

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

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

function getParishNameFromVisit(
  visit: HomeVisitWithFamily,
  parishById: Map<number, Parish>,
): string {
  if (visit.family?.parish?.name) {
    return visit.family.parish.name;
  }

  if (visit.family?.parish_id) {
    return parishById.get(visit.family.parish_id)?.name ?? "Paróquia não informada";
  }

  return "Paróquia não informada";
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

export default function PainelGeralDiocese({
  onNavigate,
}: PainelGeralDioceseProps) {
  const session = getAuthSession();

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [inactiveFamilies, setInactiveFamilies] = useState<Family[]>([]);
  const [visits, setVisits] = useState<HomeVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const userRole = session?.user.system_role ?? "";

  const parishById = useMemo(() => {
    return new Map(parishes.map((parish) => [parish.id, parish]));
  }, [parishes]);

  const visitsWithFamily = useMemo<HomeVisitWithFamily[]>(() => {
    const familyById = new Map(families.map((family) => [family.id, family]));

    return visits
      .map<HomeVisitWithFamily>((visit) => ({
        ...visit,
        family: visit.family ?? familyById.get(visit.family_id) ?? null,
      }))
      .sort(sortHomeVisitsForDisplay);
  }, [families, visits]);

  const dashboardData = useMemo(() => {
    const activeParishes = parishes.filter((parish) => parish.active);
    const inactiveParishes = parishes.filter((parish) => !parish.active);
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

    const familiesByParish = activeParishes
      .map((parish) => {
        const parishFamilies = activeFamilies.filter(
          (family) => family.parish_id === parish.id,
        );

        return {
          parish,
          totalFamilies: parishFamilies.length,
          totalMembers: parishFamilies.reduce(
            (total, family) => total + countFamilyMembers(family),
            0,
          ),
        };
      })
      .filter((item) => item.totalFamilies > 0)
      .sort((firstItem, secondItem) => {
        if (secondItem.totalFamilies !== firstItem.totalFamilies) {
          return secondItem.totalFamilies - firstItem.totalFamilies;
        }

        return firstItem.parish.name.localeCompare(secondItem.parish.name);
      })
      .slice(0, 5);

    const recentParishes = [...parishes]
      .sort((firstParish, secondParish) => secondParish.id - firstParish.id)
      .slice(0, 5);

    return {
      activeParishes,
      inactiveParishes,
      activeFamilies,
      totalMembers,
      visitTotals,
      nextVisits,
      overdueVisits,
      familiesByParish,
      recentParishes,
    };
  }, [families, parishes, visitsWithFamily]);

  const quickActions = useMemo(() => {
    return [
      {
        tabId: "paroquias",
        title: "Gerenciar paróquias",
        description: "Cadastrar, editar ou desativar paróquias.",
        icon: <Church className="h-5 w-5" aria-hidden="true" />,
        enabled: userRole === "diocese_admin",
      },
      {
        tabId: "bazar",
        title: "Bazar diocesano",
        description: "Acompanhar estoque, vendas e caixa do bazar.",
        icon: <ShoppingBag className="h-5 w-5" aria-hidden="true" />,
        enabled: userRole === "diocese_admin" || userRole === "responsavel_bazar",
      },
      {
        tabId: "estoque",
        title: "Estoque diocesano",
        description: "Consultar e organizar itens da Diocese.",
        icon: <Package className="h-5 w-5" aria-hidden="true" />,
        enabled:
          userRole === "diocese_admin" || userRole === "responsavel_estoque",
      },
      {
        tabId: "relatorios",
        title: "Relatórios",
        description: "Visualizar dados consolidados da rede.",
        icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />,
        enabled: userRole === "diocese_admin",
      },
    ].filter((action) => action.enabled);
  }, [userRole]);

  const loadDashboard = async (showRefreshingState = false) => {
    try {
      setErrorMessage(null);
      setWarningMessage(null);

      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        parishesResult,
        familiesResult,
        inactiveFamiliesResult,
        recentVisitsResult,
        historyVisitsResult,
      ] = await Promise.allSettled([
        listDioceseParishes(),
        listDioceseFamilies(),
        listDioceseInactiveFamilies(),
        listDioceseRecentHomeVisits(),
        listDioceseHomeVisitsHistory(),
      ]);

      if (parishesResult.status === "rejected") {
        throw parishesResult.reason;
      }

      setParishes(parishesResult.value);

      const failedSections: string[] = [];

      if (familiesResult.status === "fulfilled") {
        setFamilies(familiesResult.value);
      } else {
        failedSections.push("famílias da rede");
      }

      if (inactiveFamiliesResult.status === "fulfilled") {
        setInactiveFamilies(inactiveFamiliesResult.value);
      } else {
        failedSections.push("famílias inativas");
      }

      const loadedVisits = [
        recentVisitsResult.status === "fulfilled" ? recentVisitsResult.value : [],
        historyVisitsResult.status === "fulfilled" ? historyVisitsResult.value : [],
      ].flat();

      if (
        recentVisitsResult.status === "rejected" &&
        historyVisitsResult.status === "rejected"
      ) {
        failedSections.push("visitas domiciliares");
      }

      setVisits(mergeHomeVisits(loadedVisits));

      if (failedSections.length > 0) {
        setWarningMessage(
          `Algumas informações não puderam ser carregadas agora: ${failedSections.join(
            ", ",
          )}. O painel exibirá os dados disponíveis.`,
        );
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível carregar o painel geral da Diocese.",
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
    parishes.length === 0 &&
    families.length === 0 &&
    visitsWithFamily.length === 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>

            <h2 className="text-3xl font-bold text-[var(--primary)]">
              {getGreeting()}, {session?.user.name ?? "bem-vindo(a)"}!
            </h2>

            <p className="mt-2 max-w-3xl text-lg leading-relaxed text-slate-700">
              Esta tela reúne uma visão inicial da rede da Cáritas Diocesana:
              paróquias cadastradas, famílias acompanhadas e visitas
              domiciliares registradas.
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
            Carregando painel da Diocese
          </h3>
          <p className="mt-2 text-base text-slate-600">
            Buscando paróquias, famílias e visitas registradas.
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
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
            aria-label="Resumo da Diocese"
          >
            <SummaryCard
              title="Paróquias cadastradas"
              value={parishes.length}
              description="Unidades cadastradas no sistema."
              icon={<Church className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Paróquias ativas"
              value={dashboardData.activeParishes.length}
              description="Paróquias disponíveis para operação."
              icon={<CheckCircle className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Famílias ativas"
              value={dashboardData.activeFamilies.length}
              description="Núcleos familiares acompanhados na rede."
              icon={<UsersRound className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Pessoas cadastradas"
              value={dashboardData.totalMembers}
              description="Responsáveis e membros familiares."
              icon={<ClipboardList className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Visitas marcadas"
              value={dashboardData.visitTotals.pending}
              description="Visitas ainda pendentes."
              icon={<CalendarClock className="h-7 w-7" aria-hidden="true" />}
            />

            <SummaryCard
              title="Visitas realizadas"
              value={dashboardData.visitTotals.completed}
              description="Visitas concluídas no histórico."
              icon={<CheckCircle className="h-7 w-7" aria-hidden="true" />}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Ações rápidas
                </CardTitle>
                <CardDescription className="text-base">
                  Acesse as principais áreas da Cáritas Diocesana.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-3 sm:grid-cols-2">
                {quickActions.length > 0 ? (
                  quickActions.map((action) => (
                    <Button
                      key={action.tabId}
                      type="button"
                      size="lg"
                      variant={action.tabId === "paroquias" ? "default" : "outline"}
                      onClick={() => onNavigate(action.tabId)}
                      className="min-h-20 justify-start text-left"
                    >
                      {action.icon}
                      <span className="flex flex-col items-start">
                        <span>{action.title}</span>
                        <span className="text-xs font-normal opacity-80">
                          {action.description}
                        </span>
                      </span>
                    </Button>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-base text-slate-600 sm:col-span-2">
                    Seu perfil ainda não possui ações rápidas configuradas.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Avisos importantes
                </CardTitle>
                <CardDescription className="text-base">
                  Pontos de atenção para a gestão diocesana.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {dashboardData.overdueVisits.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-bold text-amber-900">
                      {dashboardData.overdueVisits.length} visita(s) marcada(s)
                      com data passada.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      Essas visitas podem precisar de conferência, registro ou
                      reagendamento pelas paróquias.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-bold text-emerald-900">
                      Nenhuma visita vencida encontrada.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                      Não há pendências de data passada nas visitas carregadas.
                    </p>
                  </div>
                )}

                {dashboardData.inactiveParishes.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-900">
                      {dashboardData.inactiveParishes.length} paróquia(s)
                      inativa(s).
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      Verifique se essas unidades devem permanecer desativadas.
                    </p>
                  </div>
                ) : null}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Próxima etapa</Badge>
                    <p className="font-bold text-slate-900">
                      Estoque, benefícios e bazar
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Quando os endpoints estiverem integrados, este painel poderá
                    mostrar estoque consolidado, campanhas, atendimentos e vendas
                    do bazar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      Próximas visitas da rede
                    </CardTitle>
                    <CardDescription className="text-base">
                      Visitas domiciliares marcadas pelas paróquias.
                    </CardDescription>
                  </div>
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
                              Paróquia:{" "}
                              <strong>
                                {getParishNameFromVisit(visit, parishById)}
                              </strong>
                            </p>

                            <p className="mt-1 text-base text-slate-700">
                              Responsável familiar:{" "}
                              <strong>{getFamilyResponsibleName(visit)}</strong>
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
                      Nenhuma próxima visita encontrada
                    </h3>

                    <p className="mt-1 text-base text-slate-600">
                      Quando as paróquias agendarem visitas, elas poderão aparecer
                      aqui.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Paróquias com mais famílias
                </CardTitle>
                <CardDescription className="text-base">
                  Resumo inicial dos núcleos familiares por paróquia.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {dashboardData.familiesByParish.length > 0 ? (
                  dashboardData.familiesByParish.map((item) => (
                    <article
                      key={item.parish.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.parish.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            {item.parish.cnpj ?? "CNPJ não informado"}
                          </p>
                        </div>

                        <Badge>{item.totalFamilies} família(s)</Badge>
                      </div>

                      <p className="mt-3 text-sm text-slate-700">
                        Pessoas cadastradas nesta paróquia:{" "}
                        <strong>{item.totalMembers}</strong>
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Ainda não há famílias agrupadas por paróquia
                    </h3>

                    <p className="mt-1 text-base text-slate-600">
                      Quando houver famílias cadastradas com dados de paróquia, o
                      ranking aparecerá aqui.
                    </p>
                  </div>
                )}

                {dashboardData.recentParishes.length > 0 ? (
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Últimas paróquias cadastradas
                    </h3>

                    <div className="mt-3 space-y-2">
                      {dashboardData.recentParishes.map((parish) => (
                        <div
                          key={parish.id}
                          className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-semibold text-slate-900">
                            {parish.name}
                          </span>

                          {parish.active ? (
                            <Badge>Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-base font-bold text-slate-700">
                  Famílias inativas
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {inactiveFamilies.length}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Núcleos familiares desativados na rede.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-base font-bold text-slate-700">
                  Paróquias inativas
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardData.inactiveParishes.length}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Unidades cadastradas, mas desativadas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-base font-bold text-slate-700">
                  Visitas canceladas
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardData.visitTotals.canceled}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Visitas registradas como canceladas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-base font-bold text-slate-700">
                  Visitas vencidas
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardData.overdueVisits.length}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Visitas marcadas com data anterior a hoje.
                </p>
              </CardContent>
            </Card>
          </section>

          {hasNoData ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <Church
                className="mx-auto h-12 w-12 text-slate-400"
                aria-hidden="true"
              />

              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Ainda não há dados para mostrar
              </h3>

              <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
                Quando a Diocese cadastrar paróquias ou quando as paróquias
                registrarem famílias e visitas, os indicadores aparecerão neste
                painel.
              </p>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}