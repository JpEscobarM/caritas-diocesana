import axios from "axios";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Edit,
  Loader2,
  Plus,
  PowerOff,
  RefreshCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  createParish,
  inactivateParish,
  listParishes,
  updateParish,
} from "../api/parishes";

import type { Parish } from "../types/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type ParishFormState = {
  name: string;
  cnpj: string;
};

const initialFormState: ParishFormState = {
  name: "",
  cnpj: "",
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    const data = error.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (status === 401) {
      return "Sua sessão expirou. Entre novamente para continuar.";
    }

    if (status === 403) {
      return "Seu usuário não tem permissão para administrar paróquias. Procure a administração da Cáritas Diocesana.";
    }

    if (data?.errors) {
      return Object.values(data.errors).flat().join(" ");
    }

    if (data?.message) {
      return data.message;
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

function normalizeCnpj(cnpj: string): string | null {
  const trimmed = cnpj.trim();
  return trimmed || null;
}

export default function ParishesManagementByDiocese() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const [form, setForm] = useState<ParishFormState>(initialFormState);
  const [deactivatingParish, setDeactivatingParish] = useState<Parish | null>(null);

  async function loadParishes() {
    try {
      setLoading(true);
      const data = await listParishes();
      setParishes(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParishes();
  }, []);

  const filteredParishes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return parishes;
    }

    return parishes.filter((parish) => {
      return (
        parish.name.toLowerCase().includes(normalizedSearch) ||
        parish.cnpj?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [parishes, search]);

  function openCreateDialog() {
    setEditingParish(null);
    setForm(initialFormState);
    setDialogOpen(true);
  }

  function openEditDialog(parish: Parish) {
    setEditingParish(parish);
    setForm({
      name: parish.name,
      cnpj: parish.cnpj ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const cnpj = normalizeCnpj(form.cnpj);

    if (!name) {
      toast.error("Informe o nome da paróquia para continuar.");
      return;
    }

    if (cnpj && cnpj.length > 18) {
      toast.error("O CNPJ deve ter no máximo 18 caracteres.");
      return;
    }

    try {
      setSaving(true);

      if (editingParish) {
        await updateParish(editingParish.id, { name, cnpj });
        toast.success("Paróquia atualizada com sucesso.");
      } else {
        await createParish({ name, cnpj, active: true });
        toast.success("Paróquia cadastrada com sucesso.");
      }

      setDialogOpen(false);
      setEditingParish(null);
      setForm(initialFormState);
      await loadParishes();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function requestDeactivate(parish: Parish) {
    setDeactivatingParish(parish);
  }

  async function confirmDeactivate() {
    if (!deactivatingParish) return;

    try {
      setSaving(true);
      const updatedParish = await inactivateParish(deactivatingParish.id);

      setParishes((current) =>
        current.map((parish) =>
          parish.id === deactivatingParish.id ? updatedParish : parish,
        ),
      );

      toast.success(`Paróquia "${deactivatingParish.name}" desativada com sucesso.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
      setDeactivatingParish(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="caritas-card-shadow">
        <CardHeader className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Paróquias cadastradas</CardTitle>
            <CardDescription>
              Cadastre, edite e desative paróquias vinculadas à Cáritas Diocesana.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={loadParishes}
              disabled={loading || saving}
            >
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              Atualizar lista
            </Button>

            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-5 w-5" aria-hidden="true" />
              Cadastrar paróquia
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="parish-search">Buscar paróquia</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="parish-search"
                placeholder="Digite o nome ou CNPJ"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-12"
                aria-describedby="parish-search-help"
              />
            </div>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-muted/50 py-12 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span className="text-lg font-semibold">Carregando paróquias...</span>
            </div>
          ) : (
            <Table>
              <TableCaption>
                Lista de paróquias cadastradas na Cáritas Diocesana.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredParishes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-7 w-7" aria-hidden="true" />
                        <strong className="text-foreground">Nenhuma paróquia encontrada.</strong>
                        <span>Revise o termo buscado ou atualize a lista.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParishes.map((parish) => (
                    <TableRow key={parish.id}>
                      <TableCell className="font-semibold text-foreground">
                        {parish.name}
                      </TableCell>

                      <TableCell>{parish.cnpj ?? "Não informado"}</TableCell>

                      <TableCell>
                        {parish.active ? (
                          <Badge>Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditDialog(parish)}
                            disabled={saving}
                          >
                            <Edit className="h-5 w-5" aria-hidden="true" />
                            Editar
                          </Button>

                          {parish.active && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => requestDeactivate(parish)}
                              disabled={saving}
                            >
                              <PowerOff className="h-5 w-5" aria-hidden="true" />
                              Desativar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deactivatingParish !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivatingParish(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar paróquia</AlertDialogTitle>
            <AlertDialogDescription>
              A paróquia <strong>"{deactivatingParish?.name}"</strong> deixará de
              aparecer como opção de login. O cadastro não será apagado.
              <br />
              <br />
              Confirme somente se tiver certeza de que esta paróquia deve ficar inativa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDeactivate}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-[var(--destructive-hover)]"
            >
              {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingParish(null);
            setForm(initialFormState);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParish ? "Editar paróquia" : "Cadastrar paróquia"}
            </DialogTitle>

            <DialogDescription>
              Preencha os dados principais. O campo CNPJ pode ficar em branco caso a informação ainda não esteja disponível.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="parish-name">Nome da paróquia</Label>

              <Input
                id="parish-name"
                name="name"
                value={form.name}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                placeholder="Exemplo: Paróquia São José"
                disabled={saving}
                required
                aria-describedby="parish-name-help"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parish-cnpj">CNPJ</Label>

              <Input
                id="parish-cnpj"
                name="cnpj"
                value={form.cnpj}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    cnpj: event.target.value,
                  }))
                }
                placeholder="Exemplo: 12.345.678/0001-90"
                disabled={saving}
                inputMode="numeric"
                aria-describedby="parish-cnpj-help"
              />

              <p id="parish-cnpj-help" className="caritas-help-text">
                Deixe em branco caso ainda não tenha essa informação.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                {editingParish ? "Salvar alterações" : "Cadastrar paróquia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
