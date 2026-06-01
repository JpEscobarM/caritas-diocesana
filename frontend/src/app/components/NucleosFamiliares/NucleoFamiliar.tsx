import { useMemo, useState } from "react";
import { RefreshCcw, HousePlus, Search } from "lucide-react";

import type { AssistedFamilyMember, Family, Parish } from "../../types/types";
import FamilyTable from "./FamilyTable";
import EditFamilyModal from "./EditFamilyModal";

const mockParish: Parish = {
  id: 1,
  name: "Paróquia São João Escobar",
  slug: "paroquia-sao-joao-escobar",
  cnpj: "05.097.806/0001-63",
  active: true,
};

const mockAssistedFamilyMembers: AssistedFamilyMember[] = [
  {
    id: 1,
    parish_id: 1,
    family_id: 1,
    name: "Maria da Silva",
    mother_name: "Ana da Silva",
    relationship: "Responsável",
    age: 42,
    registration_status: "ATIVO",
    registration_date: new Date("2025-01-10"),
    personal_income: 1800,
    is_responsible: true,
  },
  {
    id: 2,
    parish_id: 1,
    family_id: 1,
    name: "João da Silva",
    mother_name: "Maria da Silva",
    relationship: "Filho",
    age: 16,
    registration_status: "ATIVO",
    registration_date: new Date("2025-01-10"),
    personal_income: 0,
    is_responsible: false,
  },
  {
    id: 3,
    parish_id: 1,
    family_id: 2,
    name: "Carlos Oliveira",
    mother_name: "Tereza Oliveira",
    relationship: "Responsável",
    age: 51,
    registration_status: "ATIVO",
    registration_date: new Date("2025-02-03"),
    personal_income: 2200,
    is_responsible: true,
  },
  {
    id: 4,
    parish_id: 1,
    family_id: 2,
    name: "Luciana Oliveira",
    mother_name: "Tereza Oliveira",
    relationship: "Cônjuge",
    age: 47,
    registration_status: "ATIVO",
    registration_date: new Date("2025-02-03"),
    personal_income: 900,
    is_responsible: false,
  },
  {
    id: 5,
    parish_id: 1,
    family_id: 3,
    name: "Fernanda Santos",
    mother_name: "Cláudia Santos",
    relationship: "Responsável",
    age: 34,
    registration_status: "INATIVO",
    registration_date: new Date("2024-11-21"),
    personal_income: 1500,
    is_responsible: true,
  },
];

const initialMockFamilies: Family[] = [
  {
    id: 1,
    parish_id: 1,
    name: "Família Silva",
    address: "Rua das Flores, 123 - Centro",
    observations: "Família acompanhada pelo núcleo social.",
    parish: mockParish,
    responsible: mockAssistedFamilyMembers[0],
    assisted_family_members: mockAssistedFamilyMembers.filter(
      (member) => member.family_id === 1,
    ),
  },
  {
    id: 2,
    parish_id: 1,
    name: "Família Oliveira",
    address: "Av. Principal, 456 - Jardim",
    observations: null,
    parish: mockParish,
    responsible: mockAssistedFamilyMembers[2],
    assisted_family_members: mockAssistedFamilyMembers.filter(
      (member) => member.family_id === 2,
    ),
  },
  {
    id: 3,
    parish_id: 1,
    name: "Família Santos",
    address: "Rua do Comércio, 789 - Vila Nova",
    observations: "Cadastro desatualizado, revisar documentação.",
    parish: mockParish,
    responsible: mockAssistedFamilyMembers[4],
    assisted_family_members: mockAssistedFamilyMembers.filter(
      (member) => member.family_id === 3,
    ),
  },
];

export default function NucleoFamiliar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [familiaSelecionada, setFamiliaSelecionada] = useState<Family | null>(
    null,
  );
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [familias, setFamilias] = useState<Family[]>(initialMockFamilies);

  const families = useMemo(() => familias, [familias]);

  const handleEditFamily = (family: Family) => {
    setFamiliaSelecionada(family);
    setModalEdicaoAberto(true);
  };

  const handleCloseEditModal = () => {
    setModalEdicaoAberto(false);
    setFamiliaSelecionada(null);
  };

  const handleSaveFamily = (updatedFamily: Family) => {
    setFamilias((currentFamilies) =>
      currentFamilies.map((family) =>
        family.id === updatedFamily.id ? updatedFamily : family,
      ),
    );

    handleCloseEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-[var(--primary)]">
            Famílias cadastradas
          </h2>
          <p className="mt-2 text-slate-600">
            Cadastre, edite e desative famílias vinculadas à sua Paróquia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-[var(--primary)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
            <RefreshCcw className="transition-transform duration-200 group-hover:rotate-90" />
            Atualizar lista
          </button>

          <button className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
            <HousePlus className="h-5 w-5" />
            Cadastrar família
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground">
          Buscar família
        </h3>

        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite o nome ou CPF do responsável"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 focus:shadow-sm"
          />
        </div>
      </div>

      <FamilyTable
        families={families}
        searchTerm={searchTerm}
        onEditFamily={handleEditFamily}
      />

      <EditFamilyModal
        open={modalEdicaoAberto}
        family={familiaSelecionada}
        onClose={handleCloseEditModal}
        onSave={handleSaveFamily}
      />
    </div>
  );
}
