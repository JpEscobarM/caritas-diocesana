import axios from "axios";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import {
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";


// Formato do formulário — só os campos que o usuário preenche
type ParishFormState = {
  name: string;
  cnpj: string;
};

const initialFormState: ParishFormState = {
  name: "",
  cnpj: "",
};

// Transforma erros da API em mensagens que o usuário entenda.
// axios.isAxiosError verifica se o erro veio de uma chamada HTTP.
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    const data = error.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (status === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }

    if (status === 403) {
      return "Seu usuário não tem permissão para administrar paróquias. Entre em contato com o administrador da Cáritas Diocesana.";
    }

    // O Laravel retorna erros de validação dentro de "errors", cada campo com um array de mensagens
    if (data?.errors) {
      return Object.values(data.errors).flat().join(" ");
    }

    if (data?.message) {
      return data.message;
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

// CNPJ é opcional na API — retorna null se o campo estiver vazio
function normalizeCnpj(cnpj: string): string | null {
  const trimmed = cnpj.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export default function ParishesManagementByDiocese() {
  // Lista completa de paróquias carregada da API
  const [parishes, setParishes] = useState<Parish[]>([]);

  // Texto digitado no campo de busca
  const [search, setSearch] = useState("");

  // loading: carregando a lista; saving: salvando formulário ou desativando
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Controla a abertura do Dialog de criar/editar paróquia
  const [dialogOpen, setDialogOpen] = useState(false);

  // Se editingParish tiver valor, o Dialog está em modo edição; se null, está em modo criação
  const [editingParish, setEditingParish] = useState<Parish | null>(null);

  // Campos do formulario de criacao/edicao
  const [form, setForm] = useState<ParishFormState>(initialFormState);

  // Paroquia aguardando confirmacao de desativacao.
  // Se tiver valor, o AlertDialog de confirmacao esta aberto.
  const [deactivatingParish, setDeactivatingParish] = useState<Parish | null>(null);

  // Busca as paroquias da API e atualiza o estado
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

  // Carrega as paroquias assim que o componente é exibido pela primeira vez
  useEffect(() => {
    loadParishes();
  }, []);

  // Filtra as paroquias pelo texto da busca sem fazer nova chamada à API.
  // useMemo evita refiltrar toda vez que o componente re-renderiza por outros motivos.
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

  // Abre o Dialog no modo criação (formulário vazio)
  function openCreateDialog() {
    setEditingParish(null);
    setForm(initialFormState);
    setDialogOpen(true);
  }

  // Abre o Dialog no modo edição, preenchendo o formulário com os dados atuais da paróquia
  function openEditDialog(parish: Parish) {
    setEditingParish(parish);
    setForm({
      name: parish.name,
      cnpj: parish.cnpj ?? "",
    });
    setDialogOpen(true);
  }

  // Chamado ao submeter o formulário de criação ou edição
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const name = form.name.trim();
    const cnpj = normalizeCnpj(form.cnpj);

    // Validação básica antes de enviar para a API
    if (!name) {
      toast.error("Informe o nome da paróquia.");
      return;
    }

    if (cnpj && cnpj.length > 18) {
      toast.error("O CNPJ deve ter no máximo 18 caracteres.");
      return;
    }

    try {
      setSaving(true);

      if (editingParish) {
        // Modo edição — envia PATCH /parishes/{id}
        await updateParish(editingParish.id, { name, cnpj });
        toast.success("Paróquia atualizada com sucesso.");
      } else {
        // Modo criação — envia POST /parishes
        await createParish({ name, cnpj, active: true });
        toast.success("Paróquia cadastrada com sucesso.");
      }

      // Fecha o Dialog e limpa o formulário após salvar com sucesso
      setDialogOpen(false);
      setEditingParish(null);
      setForm(initialFormState);

      // Recarrega a lista para refletir as mudanças
      await loadParishes();
    } catch (error) {
      // Exibe o erro dentro do Dialog para o usuário corrigir sem perder o que digitou
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  // Primeira etapa: registra qual paróquia o usuário quer desativar.
  // Isso abre o AlertDialog de confirmação.
  function requestDeactivate(parish: Parish) {
    setDeactivatingParish(parish);
  }

  // Segunda etapa: chamada após o usuário confirmar no AlertDialog.
  // Envia PATCH /parishes/{id} com active: false.
  async function confirmDeactivate() {
    if (!deactivatingParish) return;

    try {
      setSaving(true);

      await inactivateParish(deactivatingParish.id);

      // Remove a paróquia da lista local sem precisar recarregar tudo da API
      setParishes((current) =>
        current.filter((p) => p.id !== deactivatingParish.id),
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
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Paróquias</CardTitle>
            <CardDescription>
              Cadastre, edite e desative paróquias vinculadas à Cáritas
              Diocesana.
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadParishes}
              disabled={loading || saving}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </Button>

            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nova paróquia
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando paróquias...
            </div>
          ) : (
            <Table>
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
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma paróquia encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParishes.map((parish) => (
                    <TableRow key={parish.id}>
                      <TableCell className="font-medium">
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
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditDialog(parish)}
                            disabled={saving}
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>

                          {/* Só exibe o botão Desativar se a paróquia ainda estiver ativa */}
                          {parish.active && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => requestDeactivate(parish)}
                              disabled={saving}
                            >
                              <PowerOff className="h-4 w-4" />
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

      {/* AlertDialog de confirmação antes de desativar uma paróquia.
          Só abre quando deactivatingParish tiver valor. */}
      <AlertDialog
        open={deactivatingParish !== null}
        onOpenChange={(open) => {
          // Fecha o diálogo se o usuário clicar fora ou pressionar Esc
          if (!open) setDeactivatingParish(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar paróquia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a paróquia{" "}
              <strong>"{deactivatingParish?.name}"</strong>?
              <br />
              <br />
              Ela deixará de aparecer na lista de paróquias disponíveis para
              login. Essa ação pode ser desfeita pelo suporte técnico.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDeactivate}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog reutilizado para criar e editar paróquias.
          O título e o botão de submit mudam dependendo do modo. */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParish ? "Editar paróquia" : "Cadastrar paróquia"}
            </DialogTitle>

            <DialogDescription>
              Informe os dados principais da paróquia. O CNPJ é opcional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parish-name">Nome da paróquia</Label>

              <Input
                id="parish-name"
                value={form.name}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex: Paróquia São José"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parish-cnpj">CNPJ</Label>

              <Input
                id="parish-cnpj"
                value={form.cnpj}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    cnpj: event.target.value,
                  }))
                }
                placeholder="Ex: 12.345.678/0001-90"
                disabled={saving}
              />

              <p className="text-xs text-muted-foreground">
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
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingParish ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
