import { Search } from "lucide-react";

type StepSearchProps = {
  query: string;
  onChangeQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;

};

export default function StepSearch({
  query,
  onChangeQuery,
  onSearch,

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


    </div>
  );
}
