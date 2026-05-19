export type Profile = "diocese" | "paroquia";

//SEM USO ATE O MOMENTO
// export type AuthenticateInput = {
//   profile: Profile;
//   usuario: string;
//   senha: string;
//   paroquia?: string;
// };

export type Parish = {
  id: number;
  name: string;
  slug: string;
  cnpj: string;
  active: boolean;
};

export type UserParish = Parish & {
  role: string;
};

export type AuthUser = {
  //PARA GUARDAR O USUARIO E PERMISSOES, RETORNADO AO FAZER LOGIN
  id: number;
  name: string;
  email: string;
  system_role: string;
  parishes?: UserParish[];
};

export type AuthSession = {
  token_type: string;
  access_token: string;
  abilities: string[];
  user: AuthUser;
  parish: Parish | null;
};
