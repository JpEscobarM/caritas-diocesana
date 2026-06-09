import { api } from "../../api/api";
import type { Family } from "../../types/types";
import type {
  ApiDataResponse,
  CancelHomeVisitRequest,
  HomeVisit,
  RescheduleHomeVisitRequest,
  ScheduleHomeVisitRequest,
  UpdateHomeVisitRequest,
  VisitReportRequest,
  VisitResponsibleUser,
} from "./types";

type CollectionResponse<T> =
  | T[]
  | {
      data?: T[] | { data?: T[] };
    };

type SingleResponse<T> =
  | T
  | {
      data?: T;
    };

function extractCollection<T>(responseData: CollectionResponse<T>): T[] {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (
    responseData.data &&
    !Array.isArray(responseData.data) &&
    Array.isArray(responseData.data.data)
  ) {
    return responseData.data.data;
  }

  return [];
}

function extractSingle<T>(responseData: SingleResponse<T>): T {
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "data" in responseData &&
    responseData.data !== undefined
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}

export async function listFamiliesForHomeVisits(): Promise<Family[]> {
  // A API limita automaticamente as famílias conforme o token paroquial.
  // Aqui não usamos `search`, pois precisamos apenas hidratar nomes das
  // famílias já vinculadas às visitas carregadas no histórico.
  const response = await api.get<CollectionResponse<Family>>("/families", {
    params: {
      all: false,
    },
  });

  return extractCollection<Family>(response.data);
}

export async function searchFamiliesForHomeVisits(
  searchTerm: string,
): Promise<Family[]> {
  const trimmedSearch = searchTerm.trim();

  if (trimmedSearch.length < 2) {
    return [];
  }

  const response = await api.get<CollectionResponse<Family>>("/families", {
    params: {
      search: trimmedSearch,
      all: false,
      limit: 8,
    },
  });

  return extractCollection<Family>(response.data).filter((family) => family.is_active);
}

export async function listVisitResponsibleUsers(): Promise<VisitResponsibleUser[]> {
  const response = await api.get<CollectionResponse<VisitResponsibleUser>>("/users");
  return extractCollection(response.data);
}

export async function listRecentHomeVisits(): Promise<HomeVisit[]> {
  const response = await api.get<CollectionResponse<HomeVisit>>("/home-visits");
  return extractCollection(response.data);
}

export async function listHomeVisitsHistory(): Promise<HomeVisit[]> {
  const response = await api.get<CollectionResponse<HomeVisit>>(
    "/home-visits/history",
  );

  return extractCollection(response.data);
}

export async function listFamilyHomeVisits(
  familyId: number,
): Promise<HomeVisit[]> {
  const response = await api.get<CollectionResponse<HomeVisit>>(
    `/families/${familyId}/home-visits`,
  );

  return extractCollection(response.data);
}

export async function scheduleHomeVisit(
  familyId: number,
  payload: ScheduleHomeVisitRequest,
): Promise<HomeVisit> {
  const response = await api.post<ApiDataResponse<HomeVisit>>(
    `/families/${familyId}/home-visits`,
    payload,
  );

  return extractSingle<HomeVisit>(response.data);
}

export async function updateHomeVisit(
  homeVisitId: number,
  payload: UpdateHomeVisitRequest,
): Promise<HomeVisit> {
  const response = await api.patch<ApiDataResponse<HomeVisit>>(
    `/home-visits/${homeVisitId}`,
    payload,
  );

  return extractSingle<HomeVisit>(response.data);
}

export async function deleteHomeVisit(homeVisitId: number): Promise<void> {
  await api.delete(`/home-visits/${homeVisitId}`);
}

export async function rescheduleHomeVisit(
  homeVisitId: number,
  payload: RescheduleHomeVisitRequest,
): Promise<HomeVisit> {
  const response = await api.patch<ApiDataResponse<HomeVisit>>(
    `/home-visits/${homeVisitId}/reschedule`,
    payload,
  );

  return extractSingle<HomeVisit>(response.data);
}

export async function cancelHomeVisit(
  homeVisitId: number,
  payload: CancelHomeVisitRequest = { status: "canceled" },
): Promise<HomeVisit> {
  const response = await api.patch<ApiDataResponse<HomeVisit>>(
    `/home-visits/${homeVisitId}/cancel`,
    payload,
  );

  return extractSingle<HomeVisit>(response.data);
}

export async function saveVisitReport(
  homeVisitId: number,
  payload: VisitReportRequest,
): Promise<HomeVisit> {
  const response = await api.patch<ApiDataResponse<HomeVisit>>(
    `/home-visits/${homeVisitId}/visit-record`,
    payload,
  );

  return extractSingle<HomeVisit>(response.data);
}
