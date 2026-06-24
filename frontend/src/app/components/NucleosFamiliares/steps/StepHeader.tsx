import type { WizardStep } from "../modals/CreateFamilyModal";

type StepHeaderProps = {
  currentStep: WizardStep;
};

const stepLabels: Record<WizardStep, string> = {
  1: "Busca",
  2: "Responsável",
  3: "Dados da família",
  4: "Revisão",
};

export default function StepHeader({ currentStep }: StepHeaderProps) {
  return (
    <div className="grid grid-cols-4 gap-1 sm:gap-4">
      {([1, 2, 3, 4] as WizardStep[]).map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div key={step} className="flex min-w-0 flex-col items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold sm:h-10 sm:w-10 sm:font-medium ${isActive
                ? "border-blue-600 bg-blue-600 text-white"
                : isCompleted
                  ? "border-blue-600 bg-white text-blue-600"
                  : "border-slate-300 bg-white text-slate-500"
                }`}
            >
              {step}
            </div>

            <span
              className={`line-clamp-2 text-center text-[0.68rem] leading-tight sm:text-sm ${isActive ? "font-bold text-slate-900" : "text-slate-500"
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