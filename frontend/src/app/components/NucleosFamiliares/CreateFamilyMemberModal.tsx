// src/app/components/NucleosFamiliares/CreateFamilyMemberModal.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AssistedFamilyMember } from "../../types/types";

type CreateFamilyMemberModalProps = {
  open: boolean;
  familyId: number;
  parishId: number;
  onClose: () => void;
  onSave: (newMember: AssistedFamilyMember) => void;
};

type CreateFamilyMemberFormState = {
  name: string;
  mother_name: string;
  relationship: string;
  age: string;
  registration_status: string;
  personal_income: string;
  is_responsible: boolean;
};

const initialCreateFormState: CreateFamilyMemberFormState = {
  name: "",
  mother_name: "",
  relationship: "",
  age: "",
  registration_status: "ATIVO",
  personal_income: "",
  is_responsible: false,
};

export function CreateFamilyMemberModal({
  open,
  familyId,
  parishId,
  onClose,
  onSave,
}: CreateFamilyMemberModalProps) {
  const [formData, setFormData] = useState<CreateFamilyMemberFormState>(
    initialCreateFormState,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(initialCreateFormState);
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleChange =
    (field: keyof CreateFamilyMemberFormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value =
        event.target instanceof HTMLInputElement &&
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;

      setFormData((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedMotherName = formData.mother_name.trim();
    const trimmedRelationship = formData.is_responsible
      ? "Responsável"
      : formData.relationship.trim();

    if (!trimmedName) {
      return;
    }

    const newMember: AssistedFamilyMember = {
      id: Date.now(),
      parish_id: parishId,
      family_id: familyId,
      name: trimmedName,
      mother_name: trimmedMotherName,
      relationship: trimmedRelationship,
      age: Number(formData.age.replace(/\D/g, "") || 0),
      registration_status: formData.registration_status,
      registration_date: new Date(),
      personal_income: Number(formData.personal_income.replace(",", ".") || 0),
      is_responsible: formData.is_responsible,
    };

    onSave(newMember);
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--primary)]">
              Adicionar membro
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preencha os dados do novo membro assistido.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange("name")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
                placeholder="Nome do membro"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
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
                  formData.is_responsible
                    ? "Responsável"
                    : formData.relationship
                }
                onChange={handleChange("relationship")}
                disabled={formData.is_responsible}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="Ex.: Filho, Cônjuge"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
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
                onChange={handleChange("personal_income")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
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

            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={formData.is_responsible}
                onChange={handleChange("is_responsible")}
              />
              Definir como responsável pela família
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
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
