// src/app/components/NucleosFamiliares/NucleoFamiliar.tsx
import { useEffect, useState } from "react";
import { HousePlus, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { getSessionParish } from "../../api/auth";
import {
  activateFamily,
  createFamily,
  getFamiliesFromParish,
  getInactiveFamilies,
  inactivateFamily,
} from "../../api/families";
import type { CreateFamilyRequest } from "../../types/nucleoFamiliarTypes";
import type { Family } from "../../types/types";
import CreateFamilyModal from "./CreateFamilyModal";
import EditFamilyModal from "./EditFamilyModal";
import FamilyTable from "./FamilyTable";

export default function NucleoFamiliar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [familiaSelecionada, setFamiliaSelecionada] = useState<Family | null>(
    null,
  );
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [familias, setFamilias] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [showingInactiveFamilies, setShowingInactiveFamilies] = useState(false);

  const currentParish = getSessionParish();

  const handleEditFamily = (family: Family) => {
    setFamiliaSelecionada(family);
    setModalEdicaoAberto(true);
  };

  const handleCloseEditModal = () => {
    setModalEdicaoAberto(false);
    setFamiliaSelecionada(null);
  };

  const carregarFamiliasAtivas = async () => {
    if (!currentParish) {
      toast.error("Ocorreu um erro de sessão. Faça login novamente.");
      return;
    }

    try {
      setLoadingFamilies(true);

      const familiesResponse = await getFamiliesFromParish(currentParish.name);
      setFamilias(familiesResponse);
      setShowingInactiveFamilies(false);

      if (familiesResponse.length === 0) {
        toast.error(
          "Nenhuma família cadastrada foi encontrada para sua paróquia.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Ocorreu um erro inesperado ao buscar famílias.",
      );
    } finally {
      setLoadingFamilies(false);
    }
  };

  const handleLoadInactiveFamilies = async () => {
    try {
      setLoadingFamilies(true);

      const inactiveFamilies = await getInactiveFamilies(false);
      setFamilias(inactiveFamilies);
      setShowingInactiveFamilies(true);

      if (inactiveFamilies.length === 0) {
        toast.error("Nenhuma família desativada foi encontrada.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Erro ao buscar famílias desativadas.",
      );
    } finally {
      setLoadingFamilies(false);
    }
  };


  useEffect(() => {
    void carregarFamiliasAtivas();
  }, []);

  const handleSaveFamily = async (_updatedFamily: CreateFamilyRequest) => {
    handleCloseEditModal();

    if (showingInactiveFamilies) {
      await handleLoadInactiveFamilies();
      return;
    }

    await carregarFamiliasAtivas();
  };

  const handleCreateFamily = async (payload: CreateFamilyRequest) => {
    try {
      await createFamily(payload);

      toast.success("Família cadastrada com sucesso.");
      setModalCadastroAberto(false);
      await carregarFamiliasAtivas();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao cadastrar família.",
      );
    }
  };

  const handleDeactivateFamily = async (family: Family) => {
    try {
      await inactivateFamily(family.id);
      toast.success("Família desativada com sucesso.");

      if (showingInactiveFamilies) {
        await handleLoadInactiveFamilies();
        return;
      }

      await carregarFamiliasAtivas();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao desativar família.",
      );
    }
  };

  const handleReactivateFamily = async (family: Family) => {
    try {
      await activateFamily(family.id);
      toast.success("Família reativada com sucesso.");
      await handleLoadInactiveFamilies();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao reativar família.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-[var(--primary)]">
            {showingInactiveFamilies
              ? "Famílias desativadas"
              : "Famílias cadastradas"}
          </h2>
          <p className="mt-2 text-slate-600">
            {showingInactiveFamilies
              ? "Visualize famílias desativadas vinculadas à sua paróquia."
              : "Cadastre, edite e desative famílias vinculadas à sua paróquia."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={
              showingInactiveFamilies
                ? handleLoadInactiveFamilies
                : carregarFamiliasAtivas
            }
            disabled={loadingFamilies}
            className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-[var(--primary)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              className={`transition-transform duration-200 ${loadingFamilies ? "animate-spin" : "group-hover:rotate-90"
                }`}
            />
            {loadingFamilies ? "Atualizando..." : "Atualizar lista"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!currentParish) {
                toast.error("Ocorreu um erro de sessão. Faça login novamente.");
                return;
              }

              setModalCadastroAberto(true);
            }}
            className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--chart-3)] px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
          >
            <HousePlus className="h-5 w-5" />
            Cadastrar família
          </button>

          <button
            type="button"
            onClick={
              showingInactiveFamilies
                ? carregarFamiliasAtivas
                : handleLoadInactiveFamilies
            }
            className={`group flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${showingInactiveFamilies
              ? "bg-emerald-600"
              : "bg-[var(--primary)]"
              }`}
          >
            {showingInactiveFamilies
              ? "Voltar para famílias ativas"
              : "Famílias desativadas"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground">Buscar família</h3>

        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite o nome do responsável"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 focus:shadow-sm"
          />
        </div>
      </div>

      <FamilyTable
        families={familias}
        searchTerm={searchTerm}
        onEditFamily={handleEditFamily}
        onToggleFamilyStatus={
          showingInactiveFamilies
            ? handleReactivateFamily
            : handleDeactivateFamily
        }
        toggleFamilyStatusLabel={
          showingInactiveFamilies ? "Reativar" : "Desativar"
        }
        caption={
          showingInactiveFamilies
            ? "Lista de famílias desativadas na Cáritas Paroquial."
            : "Lista de famílias cadastradas na Cáritas Paroquial."
        }
      />

      <EditFamilyModal
        open={modalEdicaoAberto}
        family={familiaSelecionada}
        onClose={handleCloseEditModal}
      />

      {currentParish && (
        <CreateFamilyModal
          open={modalCadastroAberto}
          parish={currentParish}
          onClose={() => setModalCadastroAberto(false)}
          onSave={handleCreateFamily}
        />
      )}
    </div>
  );
}