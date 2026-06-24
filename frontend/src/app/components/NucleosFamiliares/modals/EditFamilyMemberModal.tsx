// src/app/components/NucleosFamiliares/EditFamilyMemberModal.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { updateAssistedFamilyMember } from "../../../api/families";
import type { AssistedFamilyMember } from "../../../types/types";

type EditFamilyMemberModalProps = {
  open: boolean;
  member: AssistedFamilyMember | null;
  onClose: () => void;
  onSave: (updatedMember: AssistedFamilyMember) => void;
};

type EditFamilyMemberFormState = {
  cpf: string;
  birth_date: string;
  relationship: string;
  age: string;
  registration_status: string;
  personal_income: string;
};

const initialEditFormState: EditFamilyMemberFormState = {
  cpf: "",
  birth_date: "",
  relationship: "",
  age: "",
  registration_status: "ATIVO",
  personal_income: "",
};

export function EditFamilyMemberModal({
  open,
  member,
  onClose,
  onSave,
}: EditFamilyMemberModalProps) {
  const [formData, setFormData] =
    useState<EditFamilyMemberFormState>(initialEditFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !member) {
      return;
    }

    setFormData({
      cpf: member.cpf ?? "",
      birth_date: member.birth_date ?? "",
      relationship: member.relationship ?? "",
      age: String(member.age ?? ""),
      registration_status: member.registration_status ?? "ATIVO",
      personal_income: String(member.personal_income ?? ""),
    });
  }, [open, member]);

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

  if (!open || !member) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleChange =
    (field: keyof EditFamilyMemberFormState) =>
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const updatedMember = await updateAssistedFamilyMember(member.id, {
        cpf: formData.cpf.trim(),
        birth_date: formData.birth_date,
        relationship: formData.relationship.trim(),
        age: Number(formData.age.replace(/\D/g, "") || 0),
        registration_status: formData.registration_status,
        personal_income: Number(formData.personal_income.replace(",", ".") || 0),
      });

      onSave(updatedMember);
      toast.success("Membro atualizado com sucesso.");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar membro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="caritas-mobile-safe pr-2 text-xl font-semibold text-[var(--primary)] sm:text-2xl">
              Editar membro
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-500 sm:text-sm">
              Atualize apenas os dados que a API permite alterar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(100dvh-7rem)] space-y-6 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={handleChange("cpf")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
                placeholder="000.000.000-00"
                required
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Vínculo
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={handleChange("relationship")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
                placeholder="Ex.: Filho, Cônjuge"
                required
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
                placeholder="Digite a idade"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Status cadastral
              </label>
              <select
                value={formData.registration_status}
                onChange={handleChange("registration_status")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)]"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-sm font-medium text-slate-700">Nome</p>
              <p className="mt-1 text-sm text-slate-600">{member.name}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-sm font-medium text-slate-700">Nome da mãe</p>
              <p className="mt-1 text-sm text-slate-600">{member.mother_name}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-sm font-medium text-slate-700">
                Data de cadastro
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(member.registration_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-200 pt-4 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}