import { Plus } from "lucide-react";
import type { AssistedFamilyMember } from "../../../types/types";
import type { MemberFormState } from "../CreateFamilyModal";

type StepMembersProps = {
  form: MemberFormState;
  members: AssistedFamilyMember[];
  onChange: (
    field: keyof MemberFormState,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddMember: () => void;
  onRemoveMember: (memberId: number) => void;
};

export default function StepMembers({
  form,
  members,
  onChange,
  onAddMember,
  onRemoveMember,
}: StepMembersProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-medium text-slate-900">
          Membros da família
        </h3>
        <p className="mt-1 text-slate-500">
          Adicione os demais membros do núcleo familiar.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={form.name}
            onChange={onChange("name")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Nome"
          />
          <input
            type="text"
            value={form.mother_name}
            onChange={onChange("mother_name")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Nome da mãe"
          />
          <input
            type="text"
            value={form.relationship}
            onChange={onChange("relationship")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Vínculo"
          />
          <input
            type="text"
            inputMode="numeric"
            value={form.age}
            onChange={onChange("age")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Idade"
          />
          <select
            value={form.registration_status}
            onChange={onChange("registration_status")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          >
            <option value="ATIVO">ATIVO</option>
            <option value="INATIVO">INATIVO</option>
          </select>
          <input
            type="text"
            inputMode="decimal"
            value={form.personal_income}
            onChange={onChange("personal_income")}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Renda pessoal"
          />
        </div>

        <button
          type="button"
          onClick={onAddMember}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white"
        >
          <Plus className="h-4 w-4" />
          Adicionar membro
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900">{member.name}</p>
              <p className="text-sm text-slate-500">
                {member.relationship} • {member.age} anos
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemoveMember(member.id)}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
