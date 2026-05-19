import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Package,
  Home,
  LogOut,
  Bell,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Church,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { BazarPOS } from "../components/BazarPOS";
import { clearAuthSession, getAuthSession } from "../lib/auth";

export default function DiocesePage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [activeTab, setActiveTab] = useState("geral");
  const [showMissingItems, setShowMissingItems] = useState(false);
  const [showExpiringItems, setShowExpiringItems] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { id: "geral", label: "Painel Geral", icon: Home },
    { id: "paroquias", label: "Paróquias", icon: Church },
    { id: "estoque-diocesano", label: "Estoque Diocesano", icon: Package },
    { id: "bazar", label: "Bazar Diocesano", icon: ShoppingBag },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "documentos", label: "Documentos", icon: FileText },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="size-full flex bg-background">
      <aside
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary-foreground rounded-lg flex-shrink-0">
              <Heart className="w-6 h-6 text-sidebar-primary fill-sidebar-primary" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-medium">Cáritas Diocesana</h1>
                <p className="text-xs text-sidebar-foreground/70">
                  Painel Administrativo
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === item.id
                  ? "bg-sidebar-accent border-l-4 border-sidebar-primary text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? "text-sidebar-primary" : ""}`}
              />
              {!sidebarCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                  <span className="text-sm text-sidebar-primary-foreground font-medium">
                    {session?.user?.name?.slice(0, 1) ?? "D"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {session?.user?.name ?? "Usuário"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    Administrador
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent/50 transition-colors rounded-lg"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <div>
              <h2 className="text-2xl text-foreground font-medium">
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Painel Geral"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestão da Cáritas Diocesana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMissingItems(!showMissingItems)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full"></span>
            </button>
            <button
              onClick={() => setShowExpiringItems(!showExpiringItems)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5 text-destructive" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          {activeTab === "geral" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Church className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm text-success bg-success/10 px-2 py-1 rounded-full">
                      +2
                    </span>
                  </div>
                  <h3 className="text-3xl text-foreground font-medium mb-1">
                    8
                  </h3>
                  <p className="text-muted-foreground">Paróquias Ativas</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <Package className="w-6 h-6 text-secondary" />
                    </div>
                    <span className="text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                      5 itens
                    </span>
                  </div>
                  <h3 className="text-3xl text-foreground font-medium mb-1">
                    247
                  </h3>
                  <p className="text-muted-foreground">Itens em Estoque</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-sm text-success bg-success/10 px-2 py-1 rounded-full">
                      +15%
                    </span>
                  </div>
                  <h3 className="text-3xl text-foreground font-medium mb-1">
                    R$ 3.250
                  </h3>
                  <p className="text-muted-foreground">Receita do Mês</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-chart-4/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-chart-4" />
                    </div>
                    <span className="text-sm text-success bg-success/10 px-2 py-1 rounded-full">
                      +8%
                    </span>
                  </div>
                  <h3 className="text-3xl text-foreground font-medium mb-1">
                    156
                  </h3>
                  <p className="text-muted-foreground">Famílias Assistidas</p>
                </div>
              </div>

              {(showMissingItems || showExpiringItems) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {showMissingItems && (
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-warning/20">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <h3 className="text-lg text-foreground font-medium">
                          Itens em Falta
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-foreground">Cesta Básica</span>
                          <span className="text-sm px-2 py-1 bg-warning/10 text-warning rounded-full">
                            0 unidades
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-foreground">Leite em Pó</span>
                          <span className="text-sm px-2 py-1 bg-warning/10 text-warning rounded-full">
                            2 unidades
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-foreground">
                            Fraldas Geriátricas
                          </span>
                          <span className="text-sm px-2 py-1 bg-warning/10 text-warning rounded-full">
                            1 unidade
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showExpiringItems && (
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-destructive/20">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-destructive" />
                        <h3 className="text-lg text-foreground font-medium">
                          Itens Próximos ao Vencimento
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-foreground">Arroz 5kg</span>
                          <span className="text-sm px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                            3 dias
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-foreground">Óleo de Soja</span>
                          <span className="text-sm px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                            5 dias
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-foreground">Feijão 1kg</span>
                          <span className="text-sm px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                            7 dias
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg text-foreground font-medium mb-4">
                  Resumo das Atividades
                </h3>
                <p className="text-muted-foreground">
                  Acompanhe aqui os indicadores gerais da operação diocesana.
                </p>
              </div>
            </div>
          )}

          {activeTab === "bazar" && <BazarPOS />}

          {activeTab !== "geral" && activeTab !== "bazar" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl text-foreground font-medium mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-muted-foreground">
                  Esta seção será implementada em breve.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
