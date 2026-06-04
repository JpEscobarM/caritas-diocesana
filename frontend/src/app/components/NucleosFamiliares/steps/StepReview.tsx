import type { CreateFamilyResponsibleRequest } from "../../../types/nucleoFamiliarTypes";
import type { FamilyFormState } from "../CreateFamilyModal";

type StepReviewProps = {
  responsible: CreateFamilyResponsibleRequest | null;
  familyForm: FamilyFormState;
  formatCurrency: (value: number) => string;
};

export default function StepReview({
  responsible,
  familyForm,
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
          <p className="text-xs font-medium uppercase text-slate-500">CPF</p>
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
            Nome da mãe
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {responsible?.mother_name || "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">
            Vínculo
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {responsible?.relationship || "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Idade</p>
          <p className="mt-1 text-sm text-slate-900">
            {responsible ? `${responsible.age} anos` : "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">
            Status cadastral
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {responsible?.registration_status || "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">
            Data de cadastro
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {responsible?.registration_date || "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
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
      </div>
    </div>
  );
}