import axios from "axios";
import { api } from "./api";
import type { AuthSession, Profile } from "../types/types";

export const AUTH_STORAGE_KEY = "caritas.auth.session";

type AuthenticateInput = {
  profile: Profile;
  usuario: string;
  senha: string;
  paroquia?: string;
};

export async function loginDiocese(email: string, password: string) {
  const response = await api.post("/diocese/login", {
    email,
    password,
  });

  return response.data;
}

const getLoginEndpoint = (profile: Profile): string => {
  return profile === "diocese" ? "/diocese/login" : "/parish/login";
};

const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const firstValidationError = error.response?.data?.errors
      ? Object.values(error.response.data.errors)[0]
      : null;

    if (
      Array.isArray(firstValidationError) &&
      typeof firstValidationError[0] === "string"
    ) {
      return firstValidationError[0];
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro ao autenticar";
};

export const authenticate = async ({
  profile,
  usuario,
  senha,
  paroquia,
}: AuthenticateInput): Promise<AuthSession> => {
  const normalizedUser = usuario.trim();
  const normalizedPassword = senha.trim();

  if (!profile) {
    throw new Error("Selecione um perfil");
  }

  if (!normalizedUser || !normalizedPassword) {
    throw new Error("Informe usuário e senha");
  }

  if (profile === "paroquia" && !paroquia) {
    throw new Error("Por favor, selecione uma paróquia");
  }

  try {
    const endpoint = getLoginEndpoint(profile);

    const payload =
      profile === "diocese"
        ? {
            email: normalizedUser,
            password: normalizedPassword,
          }
        : {
            email: normalizedUser,
            password: normalizedPassword,
            parish_slug: paroquia,
          };

    const response = await api.post<AuthResponse>(endpoint, payload);

    const session: AuthSession = {
      ...response.data,
      profile,
    };

    setAuthSession(session);
    return session;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const setAuthSession = (session: AuthSession): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

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
