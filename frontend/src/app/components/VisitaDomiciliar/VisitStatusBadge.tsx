import type { HomeVisitRawStatus } from "./types";
import { getStatusLabel, normalizeStatus } from "./utils";

type VisitStatusBadgeProps = {
  status: HomeVisitRawStatus | null | undefined;
};

function getStatusClassName(status: HomeVisitRawStatus | null | undefined): string {
  switch (normalizeStatus(status)) {
    case "pending":
      return "bg-amber-100 text-amber-900 ring-2 ring-amber-200";
    case "completed":
      return "bg-emerald-100 text-emerald-900 ring-2 ring-emerald-200";
    case "canceled":
      return "bg-slate-200 text-slate-800 ring-2 ring-slate-300";
    default:
      return "bg-rose-100 text-rose-900 ring-2 ring-rose-200";
  }
}

export default function VisitStatusBadge({ status }: VisitStatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-sm font-bold ${getStatusClassName(
        status,
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
