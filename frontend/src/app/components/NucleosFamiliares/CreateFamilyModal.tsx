// src/app/components/NucleosFamiliares/CreateFamilyModal.tsx
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import type { AssistedFamilyMember, Family, Parish } from "../../types/types";
import { CreateFamilyMemberModal } from "./CreateFamilyMemberModal";
import StepFamilyInfo from "./steps/StepFamilyInfo";
import StepMembers from "./steps/StepMembers";
import StepResponsible from "./steps/StepResponsible";
import StepReview from "./steps/StepReview";
import StepSearch from "./steps/StepSearch";
import StepHeader from "./steps/StepHeader";

type CreateFamilyModalProps = {
  open: boolean;
  parish: Parish;
  onClose: () => void;
  onSave: (newFamily: Family) => void;
};

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type SearchFormState = {
  query: string;
};

export type MemberFormState = {
  name: string;
  mother_name: string;
  relationship: string;
  age: string;
  registration_status: string;
  personal_income: string;
};

export type FamilyFormState = {
  name: string;
  address: string;
  observations: string;
};

const initialSearchFormState: SearchFormState = {
  query: "",
};

const initialMemberFormState: MemberFormState = {
  name: "",
  mother_name: "",
  relationship: "",
  age: "",
  registration_status: "ATIVO",
  personal_income: "",
};

const initialFamilyFormState: FamilyFormState = {
  name: "",
  address: "",
  observations: "",
};

function parseMoney(value: string): number {
  return Number(
    value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".") || 0,
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function buildId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export default function CreateFamilyModal({
  open,
  parish,
  onClose,
  onSave,
}: CreateFamilyModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  const [searchForm, setSearchForm] = useState<SearchFormState>(
    initialSearchFormState,
  );
  const [familyForm, setFamilyForm] = useState<FamilyFormState>(
    initialFamilyFormState,
  );
  const [memberForm, setMemberForm] = useState<MemberFormState>(
    initialMemberFormState,
  );
  const [responsible, setResponsible] = useState<AssistedFamilyMember | null>(
    null,
  );
  const [members, setMembers] = useState<AssistedFamilyMember[]>([]);
  const [responsibleModalOpen, setResponsibleModalOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(1);
    setSearchForm(initialSearchFormState);
    setFamilyForm(initialFamilyFormState);
    setMemberForm(initialMemberFormState);
    setResponsible(null);
    setMembers([]);
    setResponsibleModalOpen(false);
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
    const responsibleIncome = responsible?.personal_income ?? 0;
    const membersIncome = members.reduce(
      (total, member) => total + member.personal_income,
      0,
    );

    return responsibleIncome + membersIncome;
  }, [members, responsible]);

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

  const handleMemberChange =
    (field: keyof MemberFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setMemberForm((current) => ({
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
    console.log("Buscar cadastro existente:", searchForm.query);
  };

  const handleSaveResponsible = (newResponsible: AssistedFamilyMember) => {
    setResponsible({
      ...newResponsible,
      parish_id: parish.id,
      family_id: 0,
      relationship: "Responsável",
      is_responsible: true,
    });

    setResponsibleModalOpen(false);
    setCurrentStep(3);
  };

  const handleAddMember = () => {
    const trimmedName = memberForm.name.trim();

    if (!trimmedName) {
      return;
    }

    const newMember: AssistedFamilyMember = {
      id: buildId(),
      parish_id: parish.id,
      family_id: 0,
      name: trimmedName,
      mother_name: memberForm.mother_name.trim(),
      relationship: memberForm.relationship.trim() || "Não definido",
      age: Number(memberForm.age.replace(/\D/g, "") || 0),
      registration_status: memberForm.registration_status,
      registration_date: new Date().toISOString().split("T")[0],
      personal_income: parseMoney(memberForm.personal_income),
      is_responsible: false,
    };

    setMembers((current) => [...current, newMember]);
    setMemberForm(initialMemberFormState);
  };

  const handleRemoveMember = (memberId: number) => {
    setMembers((current) => current.filter((member) => member.id !== memberId));
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return !!responsible;
      case 3:
        return true;
      case 4:
        return familyForm.name.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, 5) as WizardStep);
  };

  const handlePrevious = () => {
    setCurrentStep((current) => Math.max(current - 1, 1) as WizardStep);
  };

  const handleSubmit = () => {
    if (!responsible) {
      return;
    }

    const familyId = buildId();

    const normalizedResponsible: AssistedFamilyMember = {
      ...responsible,
      family_id: familyId,
      relationship: "Responsável",
      is_responsible: true,
    };

    const normalizedMembers = members.map((member) => ({
      ...member,
      family_id: familyId,
    }));

    const newFamily: Family = {
      id: familyId,
      parish_id: parish.id,
      name: familyForm.name.trim(),
      address: familyForm.address.trim() || null,
      observations: familyForm.observations.trim() || null,
      parish,
      responsible: normalizedResponsible,
      assisted_family_members: [normalizedResponsible, ...normalizedMembers],
    };

    onSave(newFamily);
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
                onNewRegistration={() => setCurrentStep(2)}
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
              <StepMembers
                form={memberForm}
                members={members}
                onChange={handleMemberChange}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
              />
            )}

            {currentStep === 4 && (
              <StepFamilyInfo form={familyForm} onChange={handleFamilyChange} />
            )}

            {currentStep === 5 && (
              <StepReview
                responsible={responsible}
                familyForm={familyForm}
                members={members}
                totalIncome={totalIncome}
                formatCurrency={formatCurrency}
              />
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

            {currentStep < 5 ? (
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
