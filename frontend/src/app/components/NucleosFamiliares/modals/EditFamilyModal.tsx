// src/app/components/NucleosFamiliares/EditFamilyModal.tsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { createAssistedFamilyMember } from "../../../api/families";
import type { AssistedFamilyMember, Family } from "../../../types/types";
import type { CreateFamilyResponsibleRequest } from "../../../types/nucleoFamiliarTypes";
import { CreateFamilyMemberModal } from "./CreateFamilyMemberModal";
import { EditFamilyMemberModal } from "./EditFamilyMemberModal";

type EditFamilyModalProps = {
  open: boolean;
  family: Family | null;
  onClose: () => void;
  onSave?: () => void;
};

type EditableMember = AssistedFamilyMember;

type FamilyFormState = {
  name: string;
  address: string;
  observations: string;
  responsibleId: number;
  assisted_family_members: EditableMember[];
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function EditFamilyModal({
  open,
  family,
  onClose,
  onSave,
}: EditFamilyModalProps) {
  const [formData, setFormData] = useState<FamilyFormState>({
    name: "",
    address: "",
    observations: "",
    responsibleId: 0,
    assisted_family_members: [],
  });

  const [createMemberModalOpen, setCreateMemberModalOpen] = useState(false);
  const [memberBeingEdited, setMemberBeingEdited] =
    useState<EditableMember | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  useEffect(() => {
    if (!open || !family) {
      return;
    }

    setFormData({
      name: family.name,
      address: family.address ?? "",
      observations: family.observations ?? "",
      responsibleId: family.responsible.id,
      assisted_family_members: family.assisted_family_members.map((member) => ({
        ...member,
        registration_date: member.registration_date,
      })),
    });
  }, [open, family]);

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

  const totalFamilyIncome = useMemo(() => {
    return formData.assisted_family_members.reduce(
      (total, member) => total + (Number(member.personal_income) || 0),
      0,
    );
  }, [formData.assisted_family_members]);

  if (!open || !family) {
    return null;
  }

  const handleFamilyFieldChange =
    (field: "name" | "address" | "observations") =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((current) => ({
          ...current,
          [field]: event.target.value,
        }));
      };

  const handleRemoveMember = (memberId: number) => {
    setFormData((current) => {
      const updatedMembers = current.assisted_family_members.filter(
        (member) => member.id !== memberId,
      );

      const removedWasResponsible = current.responsibleId === memberId;
      const nextResponsibleId = removedWasResponsible
        ? (updatedMembers[0]?.id ?? 0)
        : current.responsibleId;

      return {
        ...current,
        responsibleId: nextResponsibleId,
        assisted_family_members: updatedMembers.map((member) => ({
          ...member,
          is_responsible: member.id === nextResponsibleId,
          relationship:
            member.id === nextResponsibleId
              ? "Responsável"
              : member.relationship === "Responsável"
                ? "Não definido"
                : member.relationship,
        })),
      };
    });
  };

  const handleCreateMember = async (
    payload: CreateFamilyResponsibleRequest,
  ) => {
    try {
      setIsCreatingMember(true);

      const createdMember = await createAssistedFamilyMember(
        family.id,
        payload,
      );

      const editableMember: EditableMember = {
        ...createdMember,
        registration_date: createdMember.registration_date,
      };

      setFormData((current) => {
        const nextResponsibleId = editableMember.is_responsible
          ? editableMember.id
          : current.responsibleId;

        const updatedMembers = [
          ...current.assisted_family_members,
          editableMember,
        ].map((member) => ({
          ...member,
          is_responsible: member.id === nextResponsibleId,
          relationship:
            member.id === nextResponsibleId
              ? "Responsável"
              : member.relationship === "Responsável"
                ? "Não definido"
                : member.relationship,
        }));

        return {
          ...current,
          responsibleId: nextResponsibleId,
          assisted_family_members: updatedMembers,
        };
      });

      toast.success("Membro adicionado com sucesso.");
      setCreateMemberModalOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao adicionar membro.",
      );
    } finally {
      setIsCreatingMember(false);
    }
  };

  const handleEditMember = (updatedMember: AssistedFamilyMember) => {
    setFormData((current) => {
      const updatedMembers = current.assisted_family_members.map((member) => {
        if (member.id === updatedMember.id) {
          return {
            ...member,
            ...updatedMember,
            registration_date: updatedMember.registration_date,
          };
        }

        return member;
      });

      return {
        ...current,
        assisted_family_members: updatedMembers,
      };
    });

    setMemberBeingEdited(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--primary)]">
                Editar família
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Atualize os dados da família e gerencie os membros assistidos.
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

          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6"
          >
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Dados da família
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="family-name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Nome da família
                    </label>
                    <input
                      id="family-name"
                      type="text"
                      value={formData.name}
                      onChange={handleFamilyFieldChange("name")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
                      placeholder="Digite o nome da família"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="family-address"
                      className="text-sm font-medium text-slate-700"
                    >
                      Endereço
                    </label>
                    <input
                      id="family-address"
                      type="text"
                      value={formData.address}
                      onChange={handleFamilyFieldChange("address")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
                      placeholder="Digite o endereço"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="family-observations"
                      className="text-sm font-medium text-slate-700"
                    >
                      Observações
                    </label>
                    <textarea
                      id="family-observations"
                      value={formData.observations}
                      onChange={handleFamilyFieldChange("observations")}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
                      placeholder="Digite observações relevantes"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Resumo
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Paróquia
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {family.parish.name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Responsável atual
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {formData.assisted_family_members.find(
                        (member) => member.id === formData.responsibleId,
                      )?.name ?? "Não definido"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Total de membros
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {formData.assisted_family_members.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Renda total da família
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {formatCurrency(totalFamilyIncome)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                    Membros assistidos
                  </h3>

                  <button
                    type="button"
                    onClick={() => setCreateMemberModalOpen(true)}
                    disabled={isCreatingMember}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {isCreatingMember ? "Adicionando..." : "Adicionar membro"}
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.assisted_family_members.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Nenhum membro cadastrado.
                    </div>
                  ) : (
                    formData.assisted_family_members.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="grid gap-4 lg:grid-cols-[2fr_1.4fr_1fr_auto] lg:items-center">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">
                              {member.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {member.is_responsible
                                ? "Responsável"
                                : member.relationship}
                            </p>
                          </div>

                          <div className="space-y-1 text-sm text-slate-600">
                            <p>Idade: {member.age} anos</p>
                            <p>
                              Renda: {formatCurrency(member.personal_income)}
                            </p>
                          </div>

                          <div className="space-y-1 text-sm text-slate-600">
                            <p>Status: {member.registration_status}</p>
                            <p>
                              Cadastro: {formatDate(member.registration_date)}
                            </p>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setMemberBeingEdited(member)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

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
                  Salvar alterações
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <CreateFamilyMemberModal
        open={createMemberModalOpen}
        onClose={() => setCreateMemberModalOpen(false)}
        onSave={handleCreateMember}
      />

      <EditFamilyMemberModal
        open={!!memberBeingEdited}
        member={memberBeingEdited}
        onClose={() => setMemberBeingEdited(null)}
        onSave={handleEditMember}
      />
    </>
  );
}