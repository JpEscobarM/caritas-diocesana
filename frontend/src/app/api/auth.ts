import axios from "axios";
import { api } from "./api";
import type { AuthSession, Profile } from "../types/types";

export const AUTH_STORAGE_KEY = "caritas.auth.session";

export async function loginDiocese(email: string, password: string) {
  const response = await api.post("/diocese/login", {
    email,
    password,
  });

  return response.data;
}

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

export const getParoquiaLabel = (slug: string | null): string => {
  const options: Record<string, string> = {
    "sagrado-coracao": "Paróquia Sagrado Coração de Jesus",
    "nossa-senhora": "Paróquia Nossa Senhora Aparecida",
    "sao-jose": "Paróquia São José",
    "santo-antonio": "Paróquia Santo Antônio",
  };

  if (!slug) {
    return "Paróquia";
  }

  return options[slug] ?? "Paróquia";
};

export const getAuthHeaders = (): HeadersInit => {
  const session = getAuthSession();

  if (!session) {
    return {};
  }

  return {
    Authorization: `${session.token_type} ${session.access_token}`,
  };
};
