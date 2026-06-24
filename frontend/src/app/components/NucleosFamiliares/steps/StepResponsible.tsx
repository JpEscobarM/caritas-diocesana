import { CreateFamilyResponsibleRequest } from "../../../types/nucleoFamiliarTypes";
import type { AssistedFamilyMember } from "../../../types/types";

type StepResponsibleProps = {
  responsible: CreateFamilyResponsibleRequest | null;
  onOpenCreateModal: () => void;
  onNextStep: () => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function StepResponsible({
  responsible,
  onOpenCreateModal,
  onNextStep,
}: StepResponsibleProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-xl font-medium leading-tight text-slate-900 sm:text-2xl">
          Responsável familiar
        </h3>
        <p className="mt-1 text-slate-500">
          Cadastre o responsável principal do núcleo familiar.
        </p>
      </div>

      {responsible ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Nome
              </p>
              <p className="mt-1 text-sm text-slate-900">{responsible.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Nome da mãe
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {responsible.mother_name || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Idade
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {responsible.age} anos
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Status cadastral
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {responsible.registration_status}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase text-slate-500">
                Renda pessoal
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {formatCurrency(responsible.personal_income)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-700"
            >
              Editar responsável
            </button>

            <button
              type="button"
              onClick={onNextStep}
              className="min-h-12 rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-bold text-white"
            >
              Avançar para membros
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-8">
          <p className="text-slate-600">
            Nenhum responsável cadastrado até o momento.
          </p>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-4 min-h-12 rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-white"
          >
            Cadastrar responsável
          </button>
        </div>
      )}
    </div>
  );
}
