import type { AuthUser, Family } from "../../types/types";

export type HomeVisitStatus = "pending" | "completed" | "canceled";

// A API pode retornar variações do status de cancelamento, como "cancelled".
// No frontend, normalizamos para HomeVisitStatus antes de contar, filtrar e exibir.
export type HomeVisitRawStatus = HomeVisitStatus | "cancelled" | string;

export type VisitScope = "mine" | "all";

export type VisitResponsibleUser = Pick<
  AuthUser,
  "id" | "name" | "email" | "system_role" | "parishes"
>;

export type HomeVisit = {
  id: number;
  family_id: number;
  user_id: number;
  visit_date: string;
  notes: string | null;
  forwarding: string | null;
  next_visit_date: string | null;
  status: HomeVisitRawStatus;

  // Alguns retornos da API podem vir com a família e o usuário responsável carregados.
  // Quando não vierem, o frontend cruza com as famílias carregadas e com a sessão.
  family?: Family | null;
  user?: VisitResponsibleUser | null;
};

export type HomeVisitWithFamily = HomeVisit & {
  family?: Family | null;
  responsibleVisitor?: VisitResponsibleUser | null;
};

export type ApiDataResponse<T> = {
  data: T;
};

export type ScheduleHomeVisitRequest = {
  user_id: number;
  visit_date: string;
  notes?: string | null;
};

export type UpdateHomeVisitRequest = {
  user_id?: number;
  visit_date?: string;
  notes?: string | null;
  forwarding?: string | null;
  next_visit_date?: string | null;
  status?: HomeVisitStatus;
};

export type RescheduleHomeVisitRequest = {
  visit_date: string;
};

export type CancelHomeVisitRequest = {
  status: "canceled";
};

export type VisitReportRequest = {
  notes: string;
  forwarding?: string | null;
  next_visit_date?: string | null;
  status: "completed";
};
