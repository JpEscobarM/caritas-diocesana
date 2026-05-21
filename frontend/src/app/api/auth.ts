import axios from "axios";
import { api } from "./api";
import type { AuthSession, Parish } from "../types/types";

export const AUTH_STORAGE_KEY = "caritas.auth.session";

//LOGIN DA DIOCESE----
export async function loginDiocese(email: string, password: string) {
  const response = await api.post("/diocese/login", {
    email,
    password,
  });

  return response.data;
}
//---------------------

//SETA UMA NOVA SESSAO DO TIPO AUTHSESSION
export const setAuthSession = (session: AuthSession): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

//RETORNA UMA NOVA SESSAO DO TIPO AUTHSESSION
export const getAuthSession = (): AuthSession | null => {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    clearAuthSession();
    return null;
  }
};

//APAGA SESSAO ATUAL DO LOCALSTORAGE
export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => getAuthSession() !== null;

export const getAuthHeaders = (): HeadersInit => {
  const session = getAuthSession();

  if (!session) {
    return {};
  }

  return {
    Authorization: `${session.token_type} ${session.access_token}`,
  };
};

//LOGIN DA PAROQUIA----
export async function getParoquias(): Promise<Parish[]> {
  const response = await api.get("/parishes");

  return response.data.data;
}

export async function loginParoquia(
  email: string,
  password: string,
  parish_id: number,
) {
  const response = await api.post("/parish/login", {
    email: email,
    password: password,
    parish_id: 1,
  });
}

//---------------------
