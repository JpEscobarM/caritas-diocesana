import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  History,
  Loader2,
  RefreshCcw,
  Wallet,
  X,
} from "lucide-react";
import {
  listCashboxLogs,
  listCashboxes,
  updateCashbox,
} from "../../api/caixas";
import type {
  Caixa,
  CaixaLog,
  CaixaMovimentacaoPayload,
  CaixaMovementType,
} from "../../types/CaixaTypes";
import type { Family } from "../../types/types";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type CaixaParoquiaCardProps = {
  parishId: number;
  parishName?: string;
  families?: Family[];
  className?: string;
};

type CaixaMovimentacaoModalProps = {
  type: CaixaMovementType;
  cashbox: Caixa;
  families: Family[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: Omit<CaixaMovimentacaoPayload, "name" | "movement_type">,
  ) => void;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function formatCurrency(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMovementLabel(type: CaixaMovementType) {
  return type === "in" ? "Entrada" : "Saída";
}

function getMovementIcon(type: CaixaMovementType) {
  return type === "in" ? (
    <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
  ) : (
    <ArrowDownCircle className="h-4 w-4 text-red-600" />
  );
}

function CaixaMovimentacaoModal({
  type,
  cashbox,
  families,
  submitting,
  onClose,
  onSubmit,
}: CaixaMovimentacaoModalProps) {
  const [amount, setAmount] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [reason, setReason] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  const isEntrada = type === "in";
  const title = isEntrada ? "Entrada de caixa" : "Saída de caixa";
  const description = isEntrada
    ? "Registre valores recebidos pela paróquia."
    : "Registre valores utilizados ou repassados pela paróquia.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAmount = Number(String(amount).replace(",", "."));

    if (!normalizedAmount || normalizedAmount <= 0) {
      setValidationMessage("Informe um valor maior que zero.");
      return;
    }

    setValidationMessage(null);

    onSubmit({
      amount: normalizedAmount,
      ...(familyId ? { family_id: Number(familyId) } : {}),
      reason: reason.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Caixa selecionado
            </p>
            <p className="mt-1 font-semibold text-slate-900">{cashbox.name}</p>
            <p className="mt-1 text-sm text-slate-600">
              Saldo atual: {formatCurrency(cashbox.balance)}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="cashbox-amount"
            >
              Valor
            </label>
            <input
              id="cashbox-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              disabled={submitting}
            />
          </div>

          {families.length > 0 ? (
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="cashbox-family"
              >
                Família relacionada{" "}
                <span className="text-slate-400">(opcional)</span>
              </label>
              <select
                id="cashbox-family"
                value={familyId}
                onChange={(event) => setFamilyId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                disabled={submitting}
              >
                <option value="">Sem família vinculada</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="cashbox-reason"
            >
              Motivo/observação{" "}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="cashbox-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                isEntrada
                  ? "Ex.: Doação recebida, campanha, contribuição..."
                  : "Ex.: Auxílio emergencial, compra, repasse..."
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              disabled={submitting}
            />
          </div>

          {validationMessage ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {validationMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Registrar {isEntrada ? "entrada" : "saída"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CaixaParoquiaCard({
  parishId,
  parishName,
  families = [],
  className = "",
}: CaixaParoquiaCardProps) {
  const [cashboxes, setCashboxes] = useState<Caixa[]>([]);
  const [logs, setLogs] = useState<CaixaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalType, setModalType] = useState<CaixaMovementType | null>(null);
  const [showRecentMovements, setShowRecentMovements] = useState(false);

  const cashbox = useMemo(
    () =>
      cashboxes.find((item) => Number(item.id) === Number(parishId)) ?? null,
    [cashboxes, parishId],
  );

  const filteredLogs = useMemo(
    () =>
      logs
        .filter((log) => Number(log.cashbox_id) === Number(parishId))
        .sort((firstLog, secondLog) => {
          const firstDate = new Date(firstLog.created_at).getTime();
          const secondDate = new Date(secondLog.created_at).getTime();
          return secondDate - firstDate;
        })
        .slice(0, 5),
    [logs, parishId],
  );

  const activeFamilies = useMemo(
    () => families.filter((family) => family.is_active !== false),
    [families],
  );

  const loadCashboxData = useCallback(async (showRefreshingState = false) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [cashboxesResult, logsResult] = await Promise.all([
        listCashboxes(),
        listCashboxLogs(),
      ]);

      setCashboxes(cashboxesResult);
      setLogs(logsResult);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível carregar o caixa da paróquia.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCashboxData();
  }, [loadCashboxData]);

  const handleMovementSubmit = async (
    payload: Omit<CaixaMovimentacaoPayload, "name" | "movement_type">,
  ) => {
    if (!cashbox || !modalType) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const updatedCashbox = await updateCashbox(cashbox.id, {
        ...payload,
        name: cashbox.name,
        movement_type: modalType,
      });

      setCashboxes((currentCashboxes) =>
        currentCashboxes.map((currentCashbox) =>
          currentCashbox.id === updatedCashbox.id
            ? updatedCashbox
            : currentCashbox,
        ),
      );
      setModalType(null);
      setSuccessMessage(
        `${getMovementLabel(modalType)} de ${formatCurrency(
          payload.amount,
        )} registrada com sucesso.`,
      );

      const updatedLogs = await listCashboxLogs();
      setLogs(updatedLogs);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível registrar a movimentação do caixa.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wallet className="h-5 w-5 text-slate-600" />
                Caixa da Paróquia
              </CardTitle>
              <CardDescription>
                Controle de entradas e saídas financeiras
                {parishName ? ` da ${parishName}` : " da paróquia"}.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadCashboxData(true)}
              disabled={loading || refreshing || submitting}
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando caixa da paróquia...
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">
                  Não foi possível carregar o caixa.
                </p>
                <p>{errorMessage}</p>
              </div>
            </div>
          ) : null}

          {!loading && !errorMessage && !cashbox ? (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Caixa não encontrado.</p>
                <p>
                  Não foi localizado um caixa com o mesmo ID da paróquia #
                  {parishId}. Verifique a configuração do caixa desta paróquia.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && !errorMessage && cashbox ? (
            <>
              <div className="rounded-2xl border bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Saldo atual
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {formatCurrency(cashbox.balance)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {cashbox.name}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={() => setModalType("in")}
                      disabled={submitting}
                      className="justify-center"
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Entrada de caixa
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalType("out")}
                      disabled={submitting}
                      className="justify-center"
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      Saída de caixa
                    </Button>
                  </div>
                </div>
              </div>

              {successMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border bg-white">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-inset"
                  onClick={() =>
                    setShowRecentMovements((currentValue) => !currentValue)
                  }
                  aria-expanded={showRecentMovements}
                >
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <History className="h-4 w-4 text-slate-500" />
                      Últimas movimentações
                    </h4>
                    <p className="text-xs text-slate-500">
                      Histórico recente de entradas e saídas deste caixa.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
                    {filteredLogs.length > 0 ? (
                      <span>{filteredLogs.length} registro(s)</span>
                    ) : null}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showRecentMovements ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {showRecentMovements ? (
                  <div className="border-t px-4 py-4">
                    {filteredLogs.length > 0 ? (
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {filteredLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5">
                                {getMovementIcon(log.movement_type)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {getMovementLabel(log.movement_type)} de{" "}
                                  {formatCurrency(log.amount)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatDateTime(log.created_at)}
                                  {log.user?.name ? ` • ${log.user.name}` : ""}
                                </p>
                                {log.reason ? (
                                  <p className="mt-1 text-sm text-slate-600">
                                    {log.reason}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
                        Nenhuma movimentação encontrada para este caixa.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {modalType && cashbox ? (
        <CaixaMovimentacaoModal
          type={modalType}
          cashbox={cashbox}
          families={activeFamilies}
          submitting={submitting}
          onClose={() => setModalType(null)}
          onSubmit={(payload) => void handleMovementSubmit(payload)}
        />
      ) : null}
    </>
  );
}
