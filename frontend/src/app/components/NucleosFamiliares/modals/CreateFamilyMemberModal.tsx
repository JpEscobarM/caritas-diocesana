// src/app/components/NucleosFamiliares/CreateFamilyMemberModal.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { X } from "lucide-react";

import type { CreateFamilyResponsibleRequest } from "../../../types/nucleoFamiliarTypes";

type CreateFamilyMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (newMember: CreateFamilyResponsibleRequest) => void;
  forceResponsible?: boolean;
};

type CreateFamilyMemberFormState = {
  name: string;
  cpf: string;
  birth_date: string;
  mother_name: string;
  relationship: string;
  age: string;
  registration_status: string;
  personal_income: string;
};

const initialCreateFormState: CreateFamilyMemberFormState = {
  name: "",
  cpf: "",
  birth_date: "",
  mother_name: "",
  relationship: "",
  age: "",
  registration_status: "ATIVO",
  personal_income: "0",
};



function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function CreateFamilyMemberModal({
  open,

  onClose,
  onSave,
  forceResponsible = false,
}: CreateFamilyMemberModalProps) {
  const [formData, setFormData] = useState<CreateFamilyMemberFormState>(
    initialCreateFormState,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData({
      ...initialCreateFormState,
      relationship: forceResponsible ? "Responsável" : "",
    });
  }, [open, forceResponsible]);

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

  if (!open) {
    return null;
  }

  const handleChange = (field: keyof CreateFamilyMemberFormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };



  function normalizeIncome(value: string): number {
    let normalized = value;

    // mantém apenas números, vírgula e ponto
    normalized = normalized.replace(/[^\d.,]/g, "");

    // converte vírgulas para ponto
    normalized = normalized.replace(/,/g, ".");

    const lastDot = normalized.lastIndexOf(".");

    if (lastDot !== -1) {
      const integerPart = normalized
        .slice(0, lastDot)
        .replace(/\./g, "");

      const decimalPart = normalized.slice(lastDot + 1);

      normalized = `${integerPart}.${decimalPart}`;
    }

    return Number(normalized || 0);
  }
  const handlePersonalIncome = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      personal_income: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedCpf = formData.cpf.trim();
    const trimmedMotherName = formData.mother_name.trim();
    const trimmedBirthDate = formData.birth_date.trim();
    const trimmedRelationship = forceResponsible
      ? "Responsável"
      : formData.relationship.trim() || "Não definido";

    if (!trimmedName) {
      return;
    }

    if (!trimmedBirthDate) {
      return;
    }

    const newMember: CreateFamilyResponsibleRequest = {
      name: trimmedName,
      cpf: trimmedCpf,
      birth_date: trimmedBirthDate,
      mother_name: trimmedMotherName,
      relationship: trimmedRelationship,
      age: Number(formData.age.replace(/\D/g, "") || 0),
      registration_status: formData.registration_status,
      registration_date: getTodayDateString(),
      personal_income: normalizeIncome(formData.personal_income),
    };

    onSave(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div></div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  CPF <span className="text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleChange("cpf")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange("birth_date")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Nome da mãe
                </label>
                <input
                  type="text"
                  value={formData.mother_name}
                  onChange={handleChange("mother_name")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  placeholder="Nome da mãe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Vínculo
                </label>
                <input
                  type="text"
                  value={
                    forceResponsible ? "Responsável" : formData.relationship
                  }
                  onChange={handleChange("relationship")}
                  disabled={forceResponsible}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Ex.: Mãe, Pai, Avó"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Idade
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.age}
                  onChange={handleChange("age")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  placeholder="Digite a idade"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Status cadastral
                </label>
                <select
                  value={formData.registration_status}
                  onChange={handleChange("registration_status")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Renda pessoal
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.personal_income}
                  onChange={handlePersonalIncome}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-[var(--primary)]"
                  placeholder="0,00"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                <p className="text-sm font-medium text-slate-700">
                  Data de cadastro
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Será definida automaticamente ao salvar.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
