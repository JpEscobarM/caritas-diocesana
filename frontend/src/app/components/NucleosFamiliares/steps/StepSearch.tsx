import { Search } from "lucide-react";

type StepSearchProps = {
  query: string;
  onChangeQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onNewRegistration: () => void;
};

export default function StepSearch({
  query,
  onChangeQuery,
  onSearch,
  onNewRegistration,
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
          className="rounded-xl bg-blue-600 px-6 py-4 text-white"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onNewRegistration}
        className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-medium text-white"
      >
        + Novo Cadastro Familiar
      </button>
    </div>
  );
}
