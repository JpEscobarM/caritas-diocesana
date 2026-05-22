import { Check } from "lucide-react";

interface WizardProps {
  steps: string[];
  currentStep: number;
  children: React.ReactNode;
}

export function Wizard({ steps, currentStep, children }: WizardProps) {
  return (
    <div className="w-full">
      <nav className="mb-8" aria-label="Etapas do formulário">
        <ol className="flex items-start justify-between gap-2">
          {steps.map((step, index) => {
            const completed = index < currentStep;
            const current = index === currentStep;

            return (
              <li key={step} className="flex flex-1 items-start">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-colors ${
                      completed
                        ? "border-success bg-success text-success-foreground"
                        : current
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                    aria-current={current ? "step" : undefined}
                  >
                    {completed ? (
                      <Check className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 max-w-28 text-sm font-semibold leading-snug ${
                      index <= currentStep ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 mt-6 h-1 flex-1 rounded-full ${
                      completed ? "bg-success" : "bg-border"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div>{children}</div>
    </div>
  );
}
