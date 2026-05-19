export type Profile = "diocese" | "paroquia";

export type ParishSummary = {
  id: number;
  name: string;
  slug: string;
  cnpj: string;
  active: boolean;
};

export type UserParish = ParishSummary & {
  role: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  system_role: string;
  parishes?: UserParish[];
};

export type AuthResponse = {
  token_type: string;
  access_token: string;
  abilities: string[];
  user: AuthUser;
  parish: ParishSummary | null;
};

export type AuthSession = AuthResponse & {
  profile: Profile;
};
