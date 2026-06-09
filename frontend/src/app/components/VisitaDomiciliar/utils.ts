import type { HomeVisit, HomeVisitRawStatus, HomeVisitStatus } from "./types";

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Ocorreu um erro inesperado.",
): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallbackMessage;
}

export function normalizeStatus(
  status: HomeVisitRawStatus | null | undefined,
): HomeVisitStatus | "unknown" {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, "_");

  switch (normalized) {
    case "pending":
    case "pendente":
    case "agendada":
    case "agendado":
    case "scheduled":
    case "marcada":
    case "marcado":
      return "pending";

    case "completed":
    case "complete":
    case "realizada":
    case "realizado":
    case "concluida":
    case "concluído":
    case "concluída":
      return "completed";

    case "canceled":
    case "cancelled":
    case "cancelada":
    case "cancelado":
      return "canceled";

    default:
      return "unknown";
  }
}

export function isVisitStatus(
  status: HomeVisitRawStatus | null | undefined,
  expectedStatus: HomeVisitStatus,
): boolean {
  return normalizeStatus(status) === expectedStatus;
}

export function getStatusLabel(
  status: HomeVisitRawStatus | null | undefined,
): string {
  switch (normalizeStatus(status)) {
    case "pending":
      return "Visita marcada";
    case "completed":
      return "Visita realizada";
    case "canceled":
      return "Visita cancelada";
    default:
      return "Status não informado";
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Não informado";
  }

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) {
    return "Não informada";
  }

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

export function toApiDateTime(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.replace("T", " ");
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return normalizedValue.slice(0, 16);
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getCurrentDatetimeLocalValue(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}

export function isDateTimeInPast(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
}

export function mergeHomeVisits(visits: HomeVisit[]): HomeVisit[] {
  const visitsById = new Map<number, HomeVisit>();

  visits.forEach((visit) => {
    visitsById.set(visit.id, {
      ...visitsById.get(visit.id),
      ...visit,
    });
  });

  return Array.from(visitsById.values()).sort(sortHomeVisitsForDisplay);
}

export function sortHomeVisitsForDisplay(
  firstVisit: HomeVisit,
  secondVisit: HomeVisit,
): number {
  const statusPriority = {
    pending: 0,
    unknown: 1,
    completed: 2,
    canceled: 3,
  } as const;

  const firstStatus = normalizeStatus(firstVisit.status);
  const secondStatus = normalizeStatus(secondVisit.status);

  const firstPriority = statusPriority[firstStatus];
  const secondPriority = statusPriority[secondStatus];

  if (firstPriority !== secondPriority) {
    return firstPriority - secondPriority;
  }

  const firstDate = new Date(
    firstVisit.visit_date.includes("T")
      ? firstVisit.visit_date
      : firstVisit.visit_date.replace(" ", "T"),
  ).getTime();
  const secondDate = new Date(
    secondVisit.visit_date.includes("T")
      ? secondVisit.visit_date
      : secondVisit.visit_date.replace(" ", "T"),
  ).getTime();

  if (Number.isNaN(firstDate) || Number.isNaN(secondDate)) {
    return firstVisit.id - secondVisit.id;
  }

  if (firstStatus === "pending") {
    return firstDate - secondDate;
  }

  return secondDate - firstDate;
}
