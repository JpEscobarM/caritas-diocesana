import { Trash2 } from "lucide-react";
import type { AssistedFamilyMember } from "../../types/types";

type EditableMember = AssistedFamilyMember & {
  registration_date: Date;
};

type FamilyMemberFormCardProps = {
  member: EditableMember;
  isResponsible: boolean;
  onSetResponsible: (memberId: number) => void;
  onRemove: (memberId: number) => void;
  onChange: <K extends keyof EditableMember>(
    memberId: number,
    field: K,
    value: EditableMember[K],
  ) => void;
};

export default function FamilyMemberFormCard({
  member,
  isResponsible,
  onSetResponsible,
  onRemove,
  onChange,
}: FamilyMemberFormCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
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
              checked={isResponsible}
              onChange={() => onSetResponsible(member.id)}
            />
            Responsável
          </label>

          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Remover membro"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nome</label>
          <input
            type="text"
            value={member.name}
            onChange={(event) =>
              onChange(member.id, "name", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
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
              onChange(member.id, "mother_name", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
            placeholder="Nome da mãe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Vínculo</label>
          <input
            type="text"
            value={isResponsible ? "Responsável" : member.relationship}
            onChange={(event) =>
              onChange(member.id, "relationship", event.target.value)
            }
            disabled={isResponsible}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="Ex.: Filho, Cônjuge"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Idade</label>
          <input
            type="text"
            inputMode="numeric"
            value={String(member.age)}
            onChange={(event) =>
              onChange(
                member.id,
                "age",
                Number(event.target.value.replace(/\D/g, "") || 0),
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
              onChange(member.id, "registration_status", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
          >
            <option value="ATIVO">ATIVO</option>
            <option value="INATIVO">INATIVO</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Data de cadastro
          </label>
          <input
            type="date"
            value={
              new Date(member.registration_date).toISOString().split("T")[0]
            }
            onChange={(event) =>
              onChange(
                member.id,
                "registration_date",
                new Date(event.target.value),
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Renda pessoal
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={String(member.personal_income)}
            onChange={(event) =>
              onChange(
                member.id,
                "personal_income",
                Number(event.target.value.replace(",", ".") || 0),
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[var(--primary)]"
            placeholder="0,00"
          />
        </div>
      </div>
    </div>
  );
}
