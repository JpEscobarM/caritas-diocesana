import { Search } from "lucide-react";
import { AssistedFamilyMember } from "../../../types/types";

type StepSearchProps = {
  query: string;
  onChangeQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  foundedMember: AssistedFamilyMember | null;
};

export default function StepSearch({
  query,
  onChangeQuery,
  onSearch,
  foundedMember,
}: StepSearchProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:gap-8">
      <Search className="h-12 w-12 text-[var(--primary)] sm:h-16 sm:w-16" />

      <div className="text-center">
        <h3 className="text-2xl font-medium leading-tight text-slate-900 sm:text-3xl">
          Verificar Cadastro Existente
        </h3>
        <p className="mt-2 text-base text-slate-500 sm:text-lg">Busque nome</p>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
        <input
          type="text"
          value={query}
          onChange={onChangeQuery}
          className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 outline-none focus:border-[var(--primary)] sm:py-4"
          placeholder="Digite CPF ou nome do responsável"
        />

        <button
          type="button"
          onClick={onSearch}
          className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] sm:py-4"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      {
        foundedMember !== null && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {foundedMember.name}
            </h2>

            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">CPF:</span>{" "}
                {foundedMember.cpf}
              </p>

              <p>
                <span className="font-medium">Idade:</span>{" "}
                {foundedMember.age}
              </p>

              <p>
                <span className="font-medium">Parentesco:</span>{" "}
                {foundedMember.relationship}
              </p>
            </div>
          </div>
        )
      }

    </div>
  );
}
