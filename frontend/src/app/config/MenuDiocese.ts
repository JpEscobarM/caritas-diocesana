import {
  Home,
  Church,
  Users,
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
    mobilePrimary: true,
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
    mobilePrimary: true,
    icon: Church,
    allowedRoles: ["diocese_admin"],
  },
  {
    id: "usuarios",
    label: "Gerenciar Usuarios",
    mobilePrimary: true,
    icon: Users,
    allowedRoles: ["diocese_admin"],
  },
  {
    id: "estoque",
    label: "Estoque Diocesano",
    mobilePrimary: true,
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
