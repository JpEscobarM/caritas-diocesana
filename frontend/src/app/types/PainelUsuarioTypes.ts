export type SystemRole = "user" | "diocese_admin";

export type ParishRole = "member" | "admin";

export type RoleOption<T extends string = string> = {
  value: T;
  label: string;
};

export type UserParish = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  role: ParishRole;
};

export type PainelUsuario = {
  id: number;
  name: string;
  email: string;
  system_role: SystemRole;
  parishes: UserParish[];
};

export type RolesData = {
  system_roles: RoleOption<SystemRole>[];
  parish_roles: RoleOption<ParishRole>[];
};

export type RolesResponse = {
  data: RolesData;
};

export type UsersListResponse = {
  data: PainelUsuario[];
};

export type UserResponse = {
  data: PainelUsuario;
};

export type CreateParishUserPayload = {
  name: string;
  email: string;
  password: string;
  system_role?: "user";
  parish_ids: number[];
  parish_role: ParishRole;
};

export type CreateDioceseAdminPayload = {
  name: string;
  email: string;
  password: string;
  system_role: "diocese_admin";
  parish_ids: number[];
  parish_role?: never;
};

export type CreateUserPayload =
  | CreateParishUserPayload
  | CreateDioceseAdminPayload;

export type UpdateUserPayload = {
  name?: string;
  email?: string;
};

export type PainelUsuarioFormState = {
  name: string;
  email: string;
  password: string;
  system_role: SystemRole;
  parish_ids: number[];
  parish_role: ParishRole;
};
