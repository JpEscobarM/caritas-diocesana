import {
  Package,
  Building2,
  Users,
  Home,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import type { ParishRole } from "../types/types";

const PARISH_SYSTEM_ROLES = ["user", "diocese_admin"];
const ALL_PARISH_ROLES: ParishRole[] = ["member", "admin", "admin_no_visits"];
const PARISH_ROLES_WITH_VISITS: ParishRole[] = ["member", "admin"];

export const menuParoquiaItems = [
  {
    id: "geral",
    label: "Painel Geral",
    icon: Home,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: ALL_PARISH_ROLES,
  },
  {
    id: "nucleos",
    label: "Núcleos Familiares",
    icon: Users,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: ALL_PARISH_ROLES,
  },
  {
    id: "estoque",
    label: "Estoque Paroquial",
    icon: Package,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: ALL_PARISH_ROLES,
  },
  {
    id: "paroquias",
    label: "Paróquias",
    icon: Building2,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: ALL_PARISH_ROLES,
  },
  {
    id: "visitas",
    label: "Visitas Domiciliares",
    icon: ClipboardList,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: PARISH_ROLES_WITH_VISITS,
  },
  {
    id: "prestacao",
    label: "Prestação de Contas",
    icon: DollarSign,
    allowedRoles: PARISH_SYSTEM_ROLES,
    allowedParishRoles: ALL_PARISH_ROLES,
  },
];
