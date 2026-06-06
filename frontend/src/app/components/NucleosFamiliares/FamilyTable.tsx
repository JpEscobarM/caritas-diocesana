// src/app/components/NucleosFamiliares/FamilyTable.tsx
import { Fragment, useMemo, useState } from "react";
import type { Family } from "../../types/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type FamilyTableProps = {
  families: Family[];
  searchTerm?: string;
  onEditFamily?: (family: Family) => void;
  onToggleFamilyStatus?: (family: Family) => void;
  toggleFamilyStatusLabel?: string;
  caption?: string;
};

function getStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "ATIVO":
      return "Ativo";
    case "INATIVO":
      return "Inativo";
    default:
      return status;
  }
}

function getStatusClassName(status: string) {
  switch (status.toUpperCase()) {
    case "ATIVO":
      return "bg-[var(--primary)]/10 text-[var(--primary)]";
    case "INATIVO":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function FamilyTable({
  families,
  searchTerm = "",
  onEditFamily,
  onToggleFamilyStatus,
  toggleFamilyStatusLabel = "Desativar",
  caption = "Lista de famílias cadastradas na Cáritas Paroquial.",
}: FamilyTableProps) {

  const [expandedFamilyId, setExpandedFamilyId] = useState<number | null>(null);
  const filteredFamilies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return families;
    }

    return families.filter((family) => {
      const familyName = family.name.toLowerCase();
      const responsibleName = family.responsible.name.toLowerCase();
      const responsibleId = family.responsible.id.toString();

      return (
        familyName.includes(normalizedSearch) ||
        responsibleName.includes(normalizedSearch) ||
        responsibleId.includes(normalizedSearch)
      );
    });
  }, [families, searchTerm]);

  const handleToggleDetails = (familyId: number) => {
    setExpandedFamilyId((currentId) =>
      currentId === familyId ? null : familyId,
    );
  };

  if (filteredFamilies.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Nenhuma família cadastrada.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableCaption className="py-4 text-sm text-slate-500">
          {caption}
        </TableCaption>

        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-slate-50">
            <TableHead className="px-4 py-3 font-semibold text-slate-800">
              Nome da família
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-slate-800">
              Responsável
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-slate-800">
              Vínculo
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-slate-800">
              Endereço
            </TableHead>
            <TableHead className="px-4 py-3 text-center font-semibold text-slate-800">
              Membros
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-slate-800">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 text-right font-semibold text-slate-800">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {

            filteredFamilies.map((family) => {
              const membersCount = family.assisted_family_members.length;
              const status = family.responsible.registration_status;
              const isExpanded = expandedFamilyId === family.id;
              const totalFamilyIncome = family.assisted_family_members.reduce(
                (total, member) => total + member.personal_income,
                0,
              );

              return (
                <Fragment key={family.id}>
                  <TableRow className="border-slate-100 transition-colors hover:bg-slate-50/70">
                    <TableCell className="px-4 py-4 font-medium text-slate-900">
                      {family.name}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-slate-700">
                      {family.responsible.name}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-slate-700">
                      {family.responsible.relationship}
                    </TableCell>

                    <TableCell className="max-w-[320px] px-4 py-4 text-slate-700">
                      {family.address ?? "Não informado"}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center text-slate-700">
                      {membersCount}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                          status,
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleDetails(family.id)}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                        >
                          {isExpanded ? "Ocultar" : "Exibir"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditFamily?.(family)}
                          className="cursor-pointer rounded-lg border border-[var(--primary)]/20 bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleFamilyStatus?.(family)}
                          disabled={!onToggleFamilyStatus}
                          className="cursor-pointer rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {toggleFamilyStatusLabel}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                      <TableCell colSpan={7} className="px-6 py-5">
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                                Dados da família
                              </h3>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  Paróquia
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {family.parish.name}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  Responsável
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {family.responsible.name}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  Idade do responsável
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {family.responsible.age} anos
                                </p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  CPF do responsável
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {family.responsible.cpf}
                                </p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  Renda total da família
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {formatCurrency(totalFamilyIncome)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                  Cadastro do responsável
                                </p>
                                <p className="mt-1 text-sm text-slate-800">
                                  {formatDate(family.responsible.registration_date)}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                              <p className="text-xs font-medium uppercase text-slate-500">
                                Endereço
                              </p>
                              <p className="mt-1 text-sm text-slate-800">
                                {family.address ?? "Não informado"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                              <p className="text-xs font-medium uppercase text-slate-500">
                                Observações
                              </p>
                              <div className="mt-1 max-h-28 overflow-auto break-words whitespace-pre-wrap text-sm text-slate-800">
                                {family.observations ??
                                  "Sem observações registradas."}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                                Membros assistidos
                              </h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.4fr] gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                                <span>Nome</span>
                                <span>Vínculo</span>
                                <span>Idade</span>
                                <span>Status</span>
                                <span>Cadastro</span>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {family.assisted_family_members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="grid grid-cols-[2fr_2fr_1fr_1fr_1.4fr] items-center gap-4 px-4 py-3 text-sm text-slate-700"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-slate-900">
                                        {member.name}
                                      </p>
                                    </div>

                                    <span>
                                      {member.is_responsible
                                        ? "Responsável"
                                        : member.relationship}
                                    </span>
                                    <span>{member.age} anos</span>
                                    <span>
                                      {getStatusLabel(member.registration_status)}
                                    </span>
                                    <span>
                                      {formatDate(member.registration_date)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}