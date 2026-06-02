import type { FamilyFormState } from "../CreateFamilyModal";

type StepFamilyInfoProps = {
  form: FamilyFormState;
  onChange: (
    field: keyof FamilyFormState,
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export default function StepFamilyInfo({
  form,
  onChange,
}: StepFamilyInfoProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-medium text-slate-900">
          Informações complementares
        </h3>
        <p className="mt-1 text-slate-500">
          Preencha os dados restantes do núcleo familiar.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nome da família
          </label>
          <input
            type="text"
            value={form.name}
            onChange={onChange("name")}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Endereço</label>
          <input
            type="text"
            value={form.address}
            onChange={onChange("address")}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Observações
          </label>
          <textarea
            value={form.observations}
            onChange={onChange("observations")}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
