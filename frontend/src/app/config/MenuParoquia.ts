import {
  Heart,
  Package,
  Users,
  Home,
  ClipboardList,
  DollarSign,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";

export const menuParoquiaItems = [
  {
    id: "geral",
    label: "Painel Geral",
    icon: Home,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
      "user", // é o que retorna ao criar um usuario admin
    ],
  },
  {
    id: "nucleos",
    label: "Núcleos Familiares",
    icon: Users,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
      "user",
    ],
  },
  {
    id: "estoque",
    label: "Estoque Paroquial",
    icon: Package,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
      "user",
    ],
  },
  {
    id: "visitas",
    label: "Visitas Domiciliares",
    icon: ClipboardList,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
      "user",
    ],
  },
  {
    id: "prestacao",
    label: "Prestação de Contas",
    icon: DollarSign,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
      "user",
    ],
  },
];
