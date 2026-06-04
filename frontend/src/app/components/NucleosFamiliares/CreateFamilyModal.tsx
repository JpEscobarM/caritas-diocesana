// src/app/components/NucleosFamiliares/CreateFamilyModal.tsx
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

import type { Parish } from "../../types/types";
import type {
  CreateFamilyRequest,
  CreateFamilyResponsibleRequest,
} from "../../types/nucleoFamiliarTypes";

import { CreateFamilyMemberModal } from "./CreateFamilyMemberModal";
import StepResponsible from "./steps/StepResponsible";
import StepSearch from "./steps/StepSearch";
import StepHeader from "./steps/StepHeader";

type CreateFamilyModalProps = {
  open: boolean;
  parish: Parish;
  onClose: () => void;
  onSave?: (newFamily: CreateFamilyRequest) => void;
};

export type WizardStep = 1 | 2 | 3 | 4;

export type SearchFormState = {
  query: string;
};

export type FamilyFormState = {
  address: string;
  observations: string;
};

const initialSearchFormState: SearchFormState = {
  query: "",
};

const initialFamilyFormState: FamilyFormState = {
  address: "",
  observations: "",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CreateFamilyModal({
  open,
  parish,
  onClose,
  onSave,
}: CreateFamilyModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [requiredSearch, setRequiredSearch] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchFormState>(
    initialSearchFormState,
  );
  const [familyForm, setFamilyForm] = useState<FamilyFormState>(
    initialFamilyFormState,
  );
  const [responsible, setResponsible] =
    useState<CreateFamilyResponsibleRequest | null>(null);
  const [responsibleModalOpen, setResponsibleModalOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(1);
    setSearchForm(initialSearchFormState);
    setFamilyForm(initialFamilyFormState);
    setResponsible(null);
    setResponsibleModalOpen(false);
    setRequiredSearch(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const totalIncome = useMemo(() => {
    return responsible?.personal_income ?? 0;
  }, [responsible]);

  if (!open) {
    return null;
  }

  const handleSearchChange =
    (field: keyof SearchFormState) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchForm((current) => ({
          ...current,
          [field]: event.target.value,
        }));
      };

  const handleFamilyChange =
    (field: keyof FamilyFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFamilyForm((current) => ({
          ...current,
          [field]: event.target.value,
        }));
      };

  const handleSearch = () => {
    if (!searchForm.query.trim()) {
      toast.error("Digite um nome ou CPF antes de verificar.");
      return;
    }

    console.log("Buscar cadastro existente:", searchForm.query);
    setRequiredSearch(true);
  };

  const handleSaveResponsible = (
    newResponsible: CreateFamilyResponsibleRequest,
  ) => {
    setResponsible(newResponsible);
    setResponsibleModalOpen(false);
    setCurrentStep(3);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return requiredSearch;
      case 2:
        return !!responsible;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, 4) as WizardStep);
  };

  const handlePrevious = () => {
    setCurrentStep((current) => Math.max(current - 1, 1) as WizardStep);
  };

  const handleSubmit = () => {
    if (!responsible) {
      toast.error("Cadastre o responsável antes de salvar.");
      return;
    }

    const payload: CreateFamilyRequest = {
      parish_id: parish.id,
      address: familyForm.address.trim() || null,
      observations: familyForm.observations.trim() || null,
      responsible: {
        ...responsible,
        relationship: "Responsável",
      },
    };

    onSave?.(payload);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-semibold text-slate-900">
              Cadastro de Núcleo Familiar
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-slate-200 px-6 py-5">
            <StepHeader currentStep={currentStep} />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            {currentStep === 1 && (
              <StepSearch
                query={searchForm.query}
                onChangeQuery={handleSearchChange("query")}
                onSearch={handleSearch}
              />
            )}

            {currentStep === 2 && (
              <StepResponsible
                responsible={responsible}
                onOpenCreateModal={() => setResponsibleModalOpen(true)}
                onNextStep={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div>
                  <h3 className="text-2xl font-medium text-slate-900">
                    Informações complementares
                  </h3>
                  <p className="mt-1 text-slate-500">
                    Preencha os dados iniciais da família.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={familyForm.address}
                      onChange={handleFamilyChange("address")}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Digite o endereço"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Observações
                    </label>
                    <textarea
                      value={familyForm.observations}
                      onChange={handleFamilyChange("observations")}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Digite observações relevantes"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div>
                  <h3 className="text-2xl font-medium text-slate-900">
                    Revisão
                  </h3>
                  <p className="mt-1 text-slate-500">
                    Confira os dados antes de concluir o cadastro.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Responsável
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {responsible?.name || "Não informado"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      CPF
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {responsible?.cpf || "Não informado"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Data de nascimento
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {responsible?.birth_date || "Não informado"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Renda pessoal
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {formatCurrency(responsible?.personal_income ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Endereço
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {familyForm.address || "Não informado"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Observações
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                      {familyForm.observations || "Sem observações"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Total de renda considerada
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Cancelar" : "Voltar"}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-white disabled:opacity-60"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-white"
              >
                Salvar cadastro
              </button>
            )}
          </div>
        </div>
      </div>

      <CreateFamilyMemberModal
        open={responsibleModalOpen}
        familyId={0}
        parishId={parish.id}
        onClose={() => setResponsibleModalOpen(false)}
        onSave={handleSaveResponsible}
        forceResponsible
      />
    </>
  );
}