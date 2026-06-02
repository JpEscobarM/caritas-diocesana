import type { AssistedFamilyMember } from "../../../types/types";
import type { FamilyFormState } from "../CreateFamilyModal";

type StepReviewProps = {
  responsible: AssistedFamilyMember | null;
  familyForm: FamilyFormState;
  members: AssistedFamilyMember[];
  totalIncome: number;
  formatCurrency: (value: number) => string;
};

export default function StepReview({
  responsible,
  familyForm,
  members,
  totalIncome,
  formatCurrency,
}: StepReviewProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-medium text-slate-900">Revisão</h3>
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
            Total de membros
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {(responsible ? 1 : 0) + members.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">
            Núcleo familiar
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {familyForm.name || "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">
            Renda total
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {formatCurrency(totalIncome)}
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
      </div>
    </div>
  );
}
