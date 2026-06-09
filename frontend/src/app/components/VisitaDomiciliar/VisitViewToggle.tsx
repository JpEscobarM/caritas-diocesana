import { CalendarDays, List, type LucideIcon } from "lucide-react";

import type { VisitViewMode } from "./types";

type VisitViewToggleProps = {
  value: VisitViewMode;
  onChange: (value: VisitViewMode) => void;
};

const options: Array<{
  value: VisitViewMode;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "list",
    label: "Lista",
    description: "Ver visitas em cartões com detalhes e ações.",
    icon: List,
  },
  {
    value: "calendar",
    label: "Agenda",
    description: "Ver visitas organizadas por data.",
    icon: CalendarDays,
  },
];

export default function VisitViewToggle({
  value,
  onChange,
}: VisitViewToggleProps) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Alternar forma de visualização das visitas"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Forma de visualização
          </h3>
          <p className="mt-1 text-base leading-relaxed text-slate-600">
            Escolha como prefere acompanhar as visitas domiciliares.
          </p>
        </div>

        <div
          className="grid gap-2 sm:grid-cols-2"
          role="group"
          aria-label="Escolher visualização em lista ou agenda"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={isSelected}
                className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-800 hover:border-[var(--primary)] hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-base font-bold">
                    {option.label}
                  </span>
                  <span
                    className={`block text-sm leading-snug ${
                      isSelected ? "text-white/90" : "text-slate-600"
                    }`}
                  >
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
