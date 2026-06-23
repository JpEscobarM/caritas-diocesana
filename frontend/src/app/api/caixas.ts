import { api } from "./api";
import type {
  Caixa,
  CaixaLog,
  CaixaMovimentacaoPayload,
} from "../types/CaixaTypes";

export async function listCashboxes(): Promise<Caixa[]> {
  const response = await api.get("/cashboxes");
  return response.data?.data ?? [];
}

export async function updateCashbox(
  cashboxId: number,
  payload: CaixaMovimentacaoPayload,
): Promise<Caixa> {
  const response = await api.patch(`/cashboxes/${cashboxId}`, payload);
  return response.data?.data;
}

export async function listCashboxLogs(): Promise<CaixaLog[]> {
  const response = await api.get("/logs-cashboxes");
  return response.data?.data ?? [];
}
