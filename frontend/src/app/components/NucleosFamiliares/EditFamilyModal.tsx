import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { AssistedFamilyMember, Family } from "../../types/types";

type EditFamilyModalProps = {
  open: boolean;
  family: Family | null;
  onClose: () => void;
  onSave?: (updatedFamily: Family) => void;
};

type EditableMember = AssistedFamilyMember & {
  registration_date: Date;
};

type FamilyFormState = {
  name: string;
  address: string;
  observations: string;
  responsibleId: number;
  assisted_family_members: EditableMember[];
};

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
        registration_date: new Date(member.registration_date),
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

  if (!open || !family) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFamilyFieldChange =
    (field: "name" | "address" | "observations") =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleMemberFieldChange = <K extends keyof EditableMember>(
    memberId: number,
    field: K,
    value: EditableMember[K],
  ) => {
    setFormData((current) => ({
      ...current,
      assisted_family_members: current.assisted_family_members.map((member) =>
        member.id === memberId ? { ...member, [field]: value } : member,
      ),
    }));
  };

  const handleResponsibleChange = (memberId: number) => {
    setFormData((current) => ({
      ...current,
      responsibleId: memberId,
      assisted_family_members: current.assisted_family_members.map(
        (member) => ({
          ...member,
          is_responsible: member.id === memberId,
          relationship:
            member.id === memberId ? "Responsável" : member.relationship,
        }),
      ),
    }));
  };

  const handleAddMember = () => {
    const newId =
      formData.assisted_family_members.length > 0
        ? Math.max(
            ...formData.assisted_family_members.map((member) => member.id),
          ) + 1
        : 1;

    const newMember: EditableMember = {
      id: newId,
      parish_id: family.parish_id,
      family_id: family.id,
      name: "",
      mother_name: "",
      relationship: "",
      age: 0,
      registration_status: "ATIVO",
      registration_date: new Date(),
      personal_income: 0,
      is_responsible: false,
    };

    setFormData((current) => ({
      ...current,
      assisted_family_members: [...current.assisted_family_members, newMember],
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
              : member.relationship,
        })),
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedMembers = formData.assisted_family_members.map((member) => ({
      ...member,
      name: member.name.trim(),
      mother_name: member.mother_name.trim(),
      relationship: member.is_responsible
        ? "Responsável"
        : member.relationship.trim(),
    }));

    const responsible =
      updatedMembers.find((member) => member.id === formData.responsibleId) ??
      updatedMembers[0];

    if (!responsible) {
      return;
    }

    const updatedFamily: Family = {
      ...family,
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      observations: formData.observations.trim() || null,
      responsible,
      assisted_family_members: updatedMembers,
    };

    onSave?.(updatedFamily);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--primary)]">
              Editar família
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atualize os dados da família, responsável e membros assistidos.
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
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
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
                    placeholder="Digite observações relevantes"
                  />
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
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar membro
                </button>
              </div>

              <div className="space-y-4">
                {formData.assisted_family_members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">
                          Membro #{member.id}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Edite os dados do membro assistido.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="radio"
                            name="responsible-member"
                            checked={formData.responsibleId === member.id}
                            onChange={() => handleResponsibleChange(member.id)}
                          />
                          Responsável
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remover membro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(event) =>
                            handleMemberFieldChange(
                              member.id,
                              "name",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
                          placeholder="Nome do membro"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Nome da mãe
                        </label>
                        <input
                          type="text"
                          value={member.mother_name}
                          onChange={(event) =>
                            handleMemberFieldChange(
                              member.id,
                              "mother_name",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
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
                            member.is_responsible
                              ? "Responsável"
                              : member.relationship
                          }
                          onChange={(event) =>
                            handleMemberFieldChange(
                              member.id,
                              "relationship",
                              event.target.value,
                            )
                          }
                          disabled={member.is_responsible}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-500"
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
                          value={String(member.age)}
                          onChange={(event) =>
                            handleMemberFieldChange(
                              member.id,
                              "age",
                              Number(
                                event.target.value.replace(/\D/g, "") || 0,
                              ),
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
                          placeholder="Digite a idade"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Status cadastral
                        </label>
                        <select
                          value={member.registration_status}
                          onChange={(event) =>
                            handleMemberFieldChange(
                              member.id,
                              "registration_status",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none hover:border-slate-200 focus:border-[var(--primary)]"
                        >
                          <option value="ATIVO">ATIVO</option>
                          <option value="INATIVO">INATIVO</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Renda pessoal
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[var(--primary)]">
                          <span className="mr-2 text-slate-500">R$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={String(member.personal_income)}
                            onChange={(event) =>
                              handleMemberFieldChange(
                                member.id,
                                "personal_income",
                                Number(
                                  event.target.value.replace(",", ".") || 0,
                                ),
                              )
                            }
                            className="w-full bg-transparent text-slate-800 outline-none"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
  );
}
