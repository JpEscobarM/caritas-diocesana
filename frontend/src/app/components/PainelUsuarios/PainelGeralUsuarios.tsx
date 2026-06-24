import axios from "axios";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Building2,
  Edit3,
  Loader2,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { getAuthSession } from "../../api/auth";
import { listParishes } from "../../api/parishes";
import {
  activateUser,
  createUser,
  inactivateUser,
  listInactiveUsers,
  listRoles,
  listUsers,
  updateUser,
} from "../../api/users";
import type {
  PainelUsuario,
  PainelUsuarioFormState,
  ParishRole,
  RolesData,
  SystemRole,
} from "../../types/PainelUsuarioTypes";
import type { Parish } from "../../types/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type RoleFilter = "all" | SystemRole;

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const INITIAL_FORM: PainelUsuarioFormState = {
  name: "",
  email: "",
  password: "",
  system_role: "user",
  parish_ids: [],
  parish_role: "member",
};

const FALLBACK_ROLES: RolesData = {
  system_roles: [
    {
      value: "user",
      label: "Usuário",
    },
    {
      value: "diocese_admin",
      label: "Admin da diocese",
    },
  ],
  parish_roles: [
    {
      value: "member",
      label: "Membro",
    },
    {
      value: "admin",
      label: "Admin da paróquia",
    },
    {
      value: "admin_no_visits",
      label: "Admin da paróquia sem visitas",
    },
  ],
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      return "Sua sessão expirou. Entre novamente para continuar.";
    }

    if (status === 403) {
      return "Seu usuário não tem permissão para realizar esta ação.";
    }

    if (status === 404) {
      return "O usuário solicitado não foi encontrado.";
    }

    if (data?.errors) {
      return Object.values(data.errors)
        .flatMap((errorItem) =>
          Array.isArray(errorItem) ? errorItem : [errorItem],
        )
        .join(" ");
    }

    if (data?.message) {
      return data.message;
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function PainelGeralUsuarios() {
  const [users, setUsers] = useState<PainelUsuario[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<PainelUsuario[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [roles, setRoles] = useState<RolesData>(FALLBACK_ROLES);

  const [search, setSearch] = useState("");
  const [parishSearch, setParishSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showingInactiveUsers, setShowingInactiveUsers] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activatingUserId, setActivatingUserId] = useState<number | null>(null);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PainelUsuario | null>(null);
  const [form, setForm] = useState<PainelUsuarioFormState>(INITIAL_FORM);

  const [userToInactivate, setUserToInactivate] =
    useState<PainelUsuario | null>(null);

  const formScrollRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = getAuthSession()?.user?.id;

  async function loadInitialData() {
    try {
      setLoading(true);

      const [usersData, parishesData, rolesData] = await Promise.all([
        listUsers(),
        listParishes(),
        listRoles(),
      ]);

      setUsers(usersData);
      setParishes(parishesData);
      setRoles(rolesData);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function refreshUsers() {
    try {
      setRefreshing(true);

      if (showingInactiveUsers) {
        const usersData = await listInactiveUsers();
        setInactiveUsers(usersData);
      } else {
        const usersData = await listUsers();
        setUsers(usersData);
      }

      toast.success("Lista de usuários atualizada.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }

  async function showActiveUsers() {
    try {
      setRefreshing(true);
      const usersData = await listUsers();
      setUsers(usersData);
      setShowingInactiveUsers(false);
      setSearch("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }

  async function showInactiveUsers() {
    try {
      setRefreshing(true);
      const usersData = await listInactiveUsers();
      setInactiveUsers(usersData);
      setShowingInactiveUsers(true);
      setSearch("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!formDialogOpen) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      formScrollRef.current?.scrollTo({ top: 0 });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [formDialogOpen, editingUser]);

  const activeParishes = useMemo(
    () =>
      parishes
        .filter((parish) => parish.active)
        .sort((firstParish, secondParish) =>
          firstParish.name.localeCompare(secondParish.name, "pt-BR"),
        ),
    [parishes],
  );

  const filteredActiveParishes = useMemo(() => {
    const normalizedSearch = parishSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeParishes;
    }

    return activeParishes.filter((parish) =>
      parish.name.toLowerCase().includes(normalizedSearch),
    );
  }, [activeParishes, parishSearch]);

  const displayedUsers = showingInactiveUsers ? inactiveUsers : users;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return displayedUsers
      .filter((user) => {
        const matchesRole =
          roleFilter === "all" || user.system_role === roleFilter;

        const matchesSearch =
          !normalizedSearch ||
          user.name.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch) ||
          user.parishes.some((parish) =>
            parish.name.toLowerCase().includes(normalizedSearch),
          );

        return matchesRole && matchesSearch;
      })
      .sort((firstUser, secondUser) =>
        firstUser.name.localeCompare(secondUser.name, "pt-BR"),
      );
  }, [displayedUsers, roleFilter, search]);

  const stats = useMemo(() => {
    const dioceseAdmins = users.filter(
      (user) => user.system_role === "diocese_admin",
    ).length;

    const parishUsers = users.filter(
      (user) => user.system_role === "user",
    ).length;

    const representedParishes = new Set(
      users.flatMap((user) => user.parishes.map((parish) => parish.id)),
    ).size;

    return {
      total: users.length,
      dioceseAdmins,
      parishUsers,
      representedParishes,
    };
  }, [users]);

  function getSystemRoleLabel(systemRole: SystemRole): string {
    return (
      roles.system_roles.find((role) => role.value === systemRole)?.label ??
      systemRole
    );
  }

  function getParishRoleLabel(parishRole: ParishRole): string {
    return (
      roles.parish_roles.find((role) => role.value === parishRole)?.label ??
      parishRole
    );
  }

  function openCreateDialog() {
    setEditingUser(null);
    setForm(INITIAL_FORM);
    setParishSearch("");
    setFormDialogOpen(true);
  }

  function openEditDialog(user: PainelUsuario) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      system_role: user.system_role,
      parish_ids: user.parishes.map((parish) => parish.id),
      parish_role: user.parishes[0]?.role ?? "member",
    });
    setFormDialogOpen(true);
  }

  function closeFormDialog() {
    if (saving) {
      return;
    }

    setFormDialogOpen(false);
    setEditingUser(null);
    setForm(INITIAL_FORM);
    setParishSearch("");
  }

  function toggleParish(parishId: number, checked: boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      parish_ids: checked
        ? Array.from(new Set([...currentForm.parish_ids, parishId]))
        : currentForm.parish_ids.filter(
            (currentParishId) => currentParishId !== parishId,
          ),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      toast.error("Informe o nome do usuário.");
      return;
    }

    if (!email) {
      toast.error("Informe o e-mail do usuário.");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      toast.error("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (
      !editingUser &&
      form.system_role === "user" &&
      form.parish_ids.length === 0
    ) {
      toast.error("Selecione ao menos uma paróquia.");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const updatedUser = await updateUser(editingUser.id, {
          name,
          email,
        });

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ),
        );

        toast.success("Usuário atualizado com sucesso.");
      } else {
        const createdUser =
          form.system_role === "diocese_admin"
            ? await createUser({
                name,
                email,
                password: form.password,
                system_role: "diocese_admin",
                parish_ids: [],
              })
            : await createUser({
                name,
                email,
                password: form.password,
                system_role: "user",
                parish_ids: form.parish_ids,
                parish_role: form.parish_role,
              });

        setUsers((currentUsers) => [createdUser, ...currentUsers]);

        toast.success("Usuário cadastrado com sucesso.");
      }

      setFormDialogOpen(false);
      setEditingUser(null);
      setForm(INITIAL_FORM);
      setParishSearch("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function requestInactivate(user: PainelUsuario) {
    if (user.id === currentUserId) {
      toast.error("Você não pode inativar a própria conta por este painel.");
      return;
    }

    setUserToInactivate(user);
  }

  async function confirmInactivate() {
    if (!userToInactivate) {
      return;
    }

    try {
      setDeleting(true);

      await inactivateUser(userToInactivate.id);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userToInactivate.id),
      );

      toast.success("Usuário inativado com sucesso.");
      setUserToInactivate(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  async function handleActivateUser(user: PainelUsuario) {
    try {
      setActivatingUserId(user.id);

      const activatedUser = await activateUser(user.id);

      setInactiveUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
      setUsers((currentUsers) => [activatedUser, ...currentUsers]);

      toast.success("Usuário reativado com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActivatingUserId(null);
    }
  }

  function renderParishes(user: PainelUsuario) {
    if (user.parishes.length === 0) {
      return (
        <span className="text-sm text-muted-foreground">Nenhuma paróquia</span>
      );
    }

    const visibleParishes = user.parishes.slice(0, 2);
    const hiddenParishesCount = user.parishes.length - visibleParishes.length;

    return (
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {visibleParishes.map((parish) => (
          <Badge
            key={parish.id}
            variant="outline"
            className="h-auto max-w-full items-start whitespace-normal px-2 py-1 text-left leading-tight"
            title={parish.name}
          >
            <Building2 className="mt-0.5 size-3 shrink-0" />
            <span className="min-w-0 break-words">{parish.name}</span>
          </Badge>
        ))}

        {hiddenParishesCount > 0 && (
          <Badge variant="secondary">+{hiddenParishesCount}</Badge>
        )}
      </div>
    );
  }

  function renderParishRoles(user: PainelUsuario) {
    const parishRoles = Array.from(
      new Set(user.parishes.map((parish) => parish.role)),
    );

    if (parishRoles.length === 0) {
      return (
        <span className="text-sm text-muted-foreground">Não se aplica</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {parishRoles.map((parishRole) => (
          <Badge
            key={parishRole}
            variant={parishRole === "admin" ? "default" : "secondary"}
          >
            {getParishRoleLabel(parishRole)}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Gerenciar usuários
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Cadastre administradores da diocese e usuários paroquiais, consulte
            seus vínculos e mantenha os dados atualizados.
          </p>
        </div>

        <div className="caritas-mobile-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshUsers()}
            disabled={refreshing || loading}
          >
            <RefreshCcw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar lista"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              showingInactiveUsers
                ? void showActiveUsers()
                : void showInactiveUsers()
            }
            disabled={refreshing || loading}
          >
            {showingInactiveUsers ? <UsersRound /> : <UserX />}
            {showingInactiveUsers ? "Ver ativos" : "Ver inativos"}
          </Button>

          <Button
            type="button"
            onClick={openCreateDialog}
            disabled={showingInactiveUsers}
            className="bg-[var(--chart-3)] text-white hover:opacity-95"
          >
            <Plus />
            Cadastrar usuário
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UsersRound className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de usuários</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins da diocese</p>
              <p className="text-2xl font-bold">{stats.dioceseAdmins}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Usuários paroquiais
              </p>
              <p className="text-2xl font-bold">{stats.parishUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Paróquias representadas
              </p>
              <p className="text-2xl font-bold">{stats.representedParishes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className=" bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>
                {showingInactiveUsers
                  ? "Usuários inativos"
                  : "Usuários ativos"}
              </CardTitle>
              <CardDescription className="mt-1">
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1
                  ? "usuário encontrado"
                  : "usuários encontrados"}
              </CardDescription>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_220px] lg:max-w-2xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome, e-mail ou paróquia"
                  className="pl-10"
                  aria-label="Buscar usuários"
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as RoleFilter)}
              >
                <SelectTrigger aria-label="Filtrar por perfil">
                  <SelectValue placeholder="Todos os perfis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os perfis</SelectItem>
                  {roles.system_roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-6">
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Carregando usuários...</p>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto buscamos os dados.
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                <UsersRound className="size-7 text-muted-foreground" />
              </div>
              <div className="max-w-md">
                <p className="font-semibold">
                  {showingInactiveUsers
                    ? "Nenhum usuário inativo encontrado"
                    : "Nenhum usuário encontrado"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showingInactiveUsers
                    ? "Revise a busca ou volte para a lista de usuários ativos."
                    : "Revise a busca ou cadastre um novo usuário para começar."}
                </p>
              </div>
              {showingInactiveUsers ? (
                <Button type="button" variant="outline" onClick={() => void showActiveUsers()}>
                  <UsersRound />
                  Ver usuários ativos
                </Button>
              ) : (
                <Button type="button" onClick={openCreateDialog}>
                  <Plus />
                  Cadastrar usuário
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden max-h-[60vh] w-full overflow-auto rounded-xl  md:block">
                <Table className="min-w-[1280px] table-fixed">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[13%]" />
                    <col className="w-[25%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                  </colgroup>

                  <TableHeader className="sticky top-0 z-20 bg-muted">
                    <TableRow>
                      <TableHead className="bg-muted">Usuário</TableHead>
                      <TableHead className="bg-muted">
                        Perfil do sistema
                      </TableHead>
                      <TableHead className="bg-muted">Paróquias</TableHead>
                      <TableHead className="bg-muted">
                        Papel paroquial
                      </TableHead>
                      <TableHead className="bg-muted pr-6 text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.map((user) => {
                      const isCurrentUser = user.id === currentUserId;

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="whitespace-normal align-middle">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                {getInitials(user.name)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className="whitespace-normal break-words font-semibold leading-tight text-foreground"
                                  title={user.name}
                                >
                                  {user.name}
                                </p>

                                <p className="mt-1 flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
                                  <Mail className="mt-0.5 size-3.5 shrink-0" />
                                  <span className="min-w-0 break-all">
                                    {user.email}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="whitespace-normal align-middle">
                            <Badge
                              variant={
                                user.system_role === "diocese_admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.system_role === "diocese_admin" && (
                                <ShieldCheck className="size-3" />
                              )}
                              {getSystemRoleLabel(user.system_role)}
                            </Badge>
                          </TableCell>

                          <TableCell className="whitespace-normal align-middle">
                            {renderParishes(user)}
                          </TableCell>

                          <TableCell className="whitespace-normal align-middle">
                            {renderParishRoles(user)}
                          </TableCell>

                          <TableCell className="whitespace-nowrap pr-6 align-middle">
                            <div className="flex items-center justify-end gap-2">
                              {!showingInactiveUsers && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit3 />
                                  Editar
                                </Button>
                              )}

                              {showingInactiveUsers ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void handleActivateUser(user)}
                                  disabled={activatingUserId === user.id}
                                  className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                >
                                  {activatingUserId === user.id ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    <UserCheck />
                                  )}
                                  Reativar
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => requestInactivate(user)}
                                  disabled={isCurrentUser}
                                  title={
                                    isCurrentUser
                                      ? "Você não pode inativar a própria conta."
                                      : "Inativar usuário"
                                  }
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <UserX />
                                  Inativar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="divide-y md:hidden">
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <article key={user.id} className="space-y-4 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{user.name}</p>
                          <p className="mt-0.5 break-all text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <Badge
                          variant={
                            user.system_role === "diocese_admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {getSystemRoleLabel(user.system_role)}
                        </Badge>
                      </div>

                      <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Paróquias
                          </p>
                          {renderParishes(user)}
                        </div>

                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Papel paroquial
                          </p>
                          {renderParishRoles(user)}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {!showingInactiveUsers && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit3 />
                            Editar
                          </Button>
                        )}

                        {showingInactiveUsers ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleActivateUser(user)}
                            disabled={activatingUserId === user.id}
                            className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            {activatingUserId === user.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <UserCheck />
                            )}
                            Reativar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => requestInactivate(user)}
                            disabled={isCurrentUser}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <UserX />
                            Inativar
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setFormDialogOpen(true);
          } else {
            closeFormDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
          >
            <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
              <DialogTitle>
                {editingUser ? "Editar usuário" : "Cadastrar usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Atualize o nome e o e-mail do usuário."
                  : "Preencha os dados e selecione as paróquias às quais o usuário terá acesso."}
              </DialogDescription>
            </DialogHeader>

            <div
              ref={formScrollRef}
              className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="user-name">Nome completo</Label>
                  <Input
                    id="user-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Exemplo: Maria da Silva"
                    autoComplete="name"
                    disabled={saving}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        email: event.target.value,
                      }))
                    }
                    placeholder="usuario@exemplo.com"
                    autoComplete="email"
                    disabled={saving}
                    required
                  />
                </div>

                {!editingUser && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="user-password">Senha inicial</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Mínimo de 8 caracteres"
                        autoComplete="new-password"
                        minLength={8}
                        disabled={saving}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Oriente o usuário a trocar a senha após o primeiro
                        acesso, caso esse fluxo exista no sistema.
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Tipo de usuário</Label>
                      <Select
                        value={form.system_role}
                        onValueChange={(value) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            system_role: value as SystemRole,
                            parish_ids:
                              value === "diocese_admin"
                                ? []
                                : currentForm.parish_ids,
                          }))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.system_roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {form.system_role === "user" && (
                      <>
                        <div className="grid gap-2">
                          <Label>Papel na paróquia</Label>
                          <Select
                            value={form.parish_role}
                            onValueChange={(value) =>
                              setForm((currentForm) => ({
                                ...currentForm,
                                parish_role: value as ParishRole,
                              }))
                            }
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.parish_roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <Label>Paróquias vinculadas</Label>
                            <span className="text-xs text-muted-foreground">
                              {form.parish_ids.length} selecionada(s)
                            </span>
                          </div>

                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={parishSearch}
                              onChange={(event) =>
                                setParishSearch(event.target.value)
                              }
                              placeholder="Buscar paróquia pelo nome"
                              className="pl-9"
                              aria-label="Buscar paróquia"
                              disabled={saving}
                            />
                          </div>

                          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border bg-muted/20 p-3">
                            {activeParishes.length === 0 ? (
                              <div className="py-6 text-center">
                                <Building2 className="mx-auto size-7 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">
                                  Nenhuma paróquia ativa disponível
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Cadastre ou ative uma paróquia antes de criar
                                  o usuário.
                                </p>
                              </div>
                            ) : filteredActiveParishes.length === 0 ? (
                              <div className="py-6 text-center">
                                <Search className="mx-auto size-7 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">
                                  Nenhuma paróquia encontrada
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Tente buscar utilizando outro nome.
                                </p>
                              </div>
                            ) : (
                              filteredActiveParishes.map((parish) => {
                                const checkboxId = `user-parish-${parish.id}`;
                                const checked = form.parish_ids.includes(
                                  parish.id,
                                );

                                return (
                                  <label
                                    key={parish.id}
                                    htmlFor={checkboxId}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-accent"
                                  >
                                    <Checkbox
                                      id={checkboxId}
                                      checked={checked}
                                      onCheckedChange={(value) =>
                                        toggleParish(parish.id, value === true)
                                      }
                                      disabled={saving}
                                    />

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium">
                                        {parish.name}
                                      </p>
                                      {parish.cnpj && (
                                        <p className="text-xs text-muted-foreground">
                                          CNPJ: {parish.cnpj}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {editingUser && editingUser.parishes.length > 0 && (
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-semibold">Vínculos atuais</p>
                    <div className="mt-2">{renderParishes(editingUser)}</div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Este formulário altera apenas os dados básicos, conforme o
                      endpoint de edição disponibilizado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t bg-background px-4 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeFormDialog}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  saving ||
                  (!editingUser &&
                    form.system_role === "user" &&
                    activeParishes.length === 0)
                }
              >
                {saving && <Loader2 className="animate-spin" />}
                {editingUser ? "Salvar alterações" : "Cadastrar usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(userToInactivate)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setUserToInactivate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário{" "}
              <strong className="text-foreground">
                {userToInactivate?.name}
              </strong>{" "}
              perderá o acesso ao sistema e seus tokens serão revogados.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmInactivate();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-[var(--destructive-hover)]"
            >
              {deleting && <Loader2 className="animate-spin" />}
              Sim, inativar usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
