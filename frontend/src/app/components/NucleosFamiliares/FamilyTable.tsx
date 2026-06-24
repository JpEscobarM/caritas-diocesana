// src/app/components/NucleosFamiliares/FamilyTable.tsx
import { Fragment, useMemo, useState, type ReactNode } from "react";
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

type InfoBlockProps = {
  label: string;
  children: ReactNode;
};

function InfoBlock({ label, children }: InfoBlockProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 break-words text-sm leading-relaxed text-slate-800">
        {children}
      </div>
    </div>
  );
}

type FamilyDetailsProps = {
  family: Family;
};

function FamilyDetails({ family }: FamilyDetailsProps) {
  const totalFamilyIncome = family.assisted_family_members.reduce(
    (total, member) => total + member.personal_income,
    0,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
          Dados da família
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoBlock label="Paróquia">{family.parish.name}</InfoBlock>
          <InfoBlock label="Responsável">{family.responsible.name}</InfoBlock>
          <InfoBlock label="Idade do responsável">
            {family.responsible.age} anos
          </InfoBlock>
          <InfoBlock label="CPF do responsável">
            {family.responsible.cpf || "Não informado"}
          </InfoBlock>
          <InfoBlock label="Renda total da família">
            {formatCurrency(totalFamilyIncome)}
          </InfoBlock>
          <InfoBlock label="Cadastro do responsável">
            {formatDate(family.responsible.registration_date)}
          </InfoBlock>
        </div>

        <InfoBlock label="Endereço">
          {family.address ?? "Não informado"}
        </InfoBlock>

        <InfoBlock label="Observações">
          <div className="max-h-40 overflow-auto whitespace-pre-wrap">
            {family.observations ?? "Sem observações registradas."}
          </div>
        </InfoBlock>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
          Membros assistidos
        </h3>

        {family.assisted_family_members.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Nenhum membro assistido informado.
          </div>
        ) : (
          <div className="space-y-3 md:hidden">
            {family.assisted_family_members.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="break-words font-bold text-slate-900">
                  {member.name}
                </p>
                <dl className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-3">
                    <dt className="font-semibold text-slate-500">Vínculo</dt>
                    <dd className="text-right">
                      {member.is_responsible ? "Responsável" : member.relationship}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-semibold text-slate-500">Idade</dt>
                    <dd>{member.age} anos</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-semibold text-slate-500">Status</dt>
                    <dd>{getStatusLabel(member.registration_status)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-semibold text-slate-500">Cadastro</dt>
                    <dd>{formatDate(member.registration_date)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}

        {family.assisted_family_members.length > 0 && (
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.4fr] gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold uppercase text-slate-600">
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
                    {member.is_responsible ? "Responsável" : member.relationship}
                  </span>
                  <span>{member.age} anos</span>
                  <span>{getStatusLabel(member.registration_status)}</span>
                  <span>{formatDate(member.registration_date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ActionButtonsProps = {
  family: Family;
  isExpanded: boolean;
  onToggleDetails: (familyId: number) => void;
  onEditFamily?: (family: Family) => void;
  onToggleFamilyStatus?: (family: Family) => void;
  toggleFamilyStatusLabel: string;
};

function ActionButtons({
  family,
  isExpanded,
  onToggleDetails,
  onEditFamily,
  onToggleFamilyStatus,
  toggleFamilyStatusLabel,
}: ActionButtonsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 md:flex md:justify-end">
      <button
        type="button"
        onClick={() => onToggleDetails(family.id)}
        className="min-h-11 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
      >
        {isExpanded ? "Ocultar" : "Exibir"}
      </button>

      <button
        type="button"
        onClick={() => onEditFamily?.(family)}
        className="min-h-11 cursor-pointer rounded-lg border border-[var(--primary)]/20 bg-amber-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
      >
        Editar
      </button>

      <button
        type="button"
        onClick={() => onToggleFamilyStatus?.(family)}
        disabled={!onToggleFamilyStatus}
        className="min-h-11 cursor-pointer rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)] px-3 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {toggleFamilyStatusLabel}
      </button>
    </div>
  );
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-4 p-3 md:hidden">
        <p className="px-1 text-sm text-slate-500">{caption}</p>

        {filteredFamilies.map((family) => {
          const membersCount = family.assisted_family_members.length;
          const status = family.responsible.registration_status;
          const isExpanded = expandedFamilyId === family.id;

          return (
            <article
              key={family.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="space-y-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Família
                    </p>
                    <h3 className="mt-1 break-words text-xl font-bold text-slate-950">
                      {family.name}
                    </h3>
                    <p className="mt-1 break-words text-base text-slate-700">
                      Responsável: <strong>{family.responsible.name}</strong>
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                      status,
                    )}`}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>

                <dl className="grid gap-3">
                  <InfoBlock label="Endereço">
                    {family.address ?? "Não informado"}
                  </InfoBlock>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoBlock label="Vínculo">
                      {family.responsible.relationship}
                    </InfoBlock>
                    <InfoBlock label="Membros">{membersCount}</InfoBlock>
                  </div>
                </dl>

                <ActionButtons
                  family={family}
                  isExpanded={isExpanded}
                  onToggleDetails={handleToggleDetails}
                  onEditFamily={onEditFamily}
                  onToggleFamilyStatus={onToggleFamilyStatus}
                  toggleFamilyStatusLabel={toggleFamilyStatusLabel}
                />
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                  <FamilyDetails family={family} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="hidden md:block">
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
            {filteredFamilies.map((family) => {
              const membersCount = family.assisted_family_members.length;
              const status = family.responsible.registration_status;
              const isExpanded = expandedFamilyId === family.id;

              return (
                <Fragment key={family.id}>
                  <TableRow className="border-slate-100 transition-colors hover:bg-slate-50/70">
                    <TableCell className="whitespace-normal px-4 py-4 font-medium text-slate-900">
                      {family.name}
                    </TableCell>

                    <TableCell className="whitespace-normal px-4 py-4 text-slate-700">
                      {family.responsible.name}
                    </TableCell>

                    <TableCell className="whitespace-normal px-4 py-4 text-slate-700">
                      {family.responsible.relationship}
                    </TableCell>

                    <TableCell className="max-w-[320px] whitespace-normal px-4 py-4 text-slate-700">
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
                      <ActionButtons
                        family={family}
                        isExpanded={isExpanded}
                        onToggleDetails={handleToggleDetails}
                        onEditFamily={onEditFamily}
                        onToggleFamilyStatus={onToggleFamilyStatus}
                        toggleFamilyStatusLabel={toggleFamilyStatusLabel}
                      />
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                      <TableCell colSpan={7} className="px-6 py-5">
                        <FamilyDetails family={family} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
