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
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
      <Search className="h-16 w-16 text-blue-600" />

      <div className="text-center">
        <h3 className="text-3xl font-medium text-slate-900">
          Verificar Cadastro Existente
        </h3>
        <p className="mt-2 text-lg text-slate-500">Busque nome</p>
      </div>

      <div className="flex w-full items-center gap-4">
        <input
          type="text"
          value={query}
          onChange={onChangeQuery}
          className="w-full rounded-xl border border-slate-300 px-4 py-4 text-slate-800 outline-none focus:border-blue-600"
          placeholder="Digite CPF ou nome do responsável"
        />

        <button
          type="button"
          onClick={onSearch}
          className="cursor-pointer rounded-xl bg-blue-600 px-6 py-4 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5  hover:shadow-md active:translate-y-0 active:scale-[0.98]"
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
