export type Profile = "diocese" | "paroquia";

//SEM USO ATE O MOMENTO
// export type AuthenticateInput = {
//   profile: Profile;
//   usuario: string;
//   senha: string;
//   paroquia?: string;
// };

// ---- Tipo de paroquia ----
export type Parish = {
  id: number;
  name: string;
  slug: string;
  cnpj: string | null;
  active: boolean;
};
//---------------------------


// ---- Tipo para cadastrar nova paroquia ----
export type CreateParishInput = {
  name: string;
  cnpj?: string | null;
  active?: boolean;
};
//--------------------------------------------


// ---- Tipo para atualizar paroquia existente ----
export type UpdateParishInput = {
  name?: string;
  cnpj?: string | null;
  active?: boolean;
};
//-------------------------------------------------


// ---- Tipo generico de resposta da API ----
// A API retorna os dados dentro de uma propriedade chamada data
// O <T> permite reutilizar esse tipo para qualquer retorno da API
// Exemplo: ApiResponse<Parish[]> ou ApiResponse<Parish>
export type ApiResponse<T> = {
  data: T;
};
//------------------------------------------------


// ---- Tipo de paroquia vinculada ao usuario ----
export type UserParish = Parish & {
  role: string;
};
//------------------------------------------------


// ---- Tipo do usuario autenticado ----
// Guarda os dados do usuario logado e suas permissoes
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  system_role: string;
  parishes?: UserParish[];
};
//---------------------------------------


// ---- Tipo da sessao de autenticacao ----
// Representa o retorno recebido ao realizar login
export type AuthSession = {
  token_type: string;
  access_token: string;
  abilities: string[];
  user: AuthUser;
  parish: Parish | null;
};
//----------------------------------------
