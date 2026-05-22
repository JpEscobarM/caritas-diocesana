import {
  Home,
  Church,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

export const menuDioceseItems = [
  {
    id: "geral",
    label: "Painel Geral",
    icon: Home,
    allowedRoles: [
      "diocese_admin",
      "atendente_social",
      "responsavel_estoque",
      "responsavel_bazar",
    ],
  },
  {
    id: "paroquias",
    label: "Gerenciar paróquias",
    icon: Church,
    allowedRoles: ["diocese_admin"],
  },
  {
    id: "estoque",
    label: "Estoque Diocesano",
    icon: Package,
    allowedRoles: ["diocese_admin", "responsavel_estoque"],
  },
  {
    id: "bazar",
    label: "Bazar Diocesano",
    icon: ShoppingBag,
    allowedRoles: ["diocese_admin", "responsavel_bazar"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    allowedRoles: ["diocese_admin"],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    allowedRoles: ["diocese_admin"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    allowedRoles: ["diocese_admin"],
  },
];
