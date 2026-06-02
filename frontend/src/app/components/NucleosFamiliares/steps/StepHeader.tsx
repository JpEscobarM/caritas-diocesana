import type { WizardStep } from "../CreateFamilyModal";

type WizardStepsProps = {
  currentStep: WizardStep;
};

const stepLabels: Record<WizardStep, string> = {
  1: "Busca",
  2: "Responsável",
  3: "Membros",
  4: "Complementares",
  5: "Revisão",
};

export default function StepHeader({ currentStep }: WizardStepsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {([1, 2, 3, 4, 5] as WizardStep[]).map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div key={step} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : isCompleted
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              {step}
            </div>

            <span
              className={`text-sm ${
                isActive ? "font-medium text-slate-900" : "text-slate-500"
              }`}
            >
              {stepLabels[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
