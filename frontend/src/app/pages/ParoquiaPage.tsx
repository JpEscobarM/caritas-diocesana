import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Heart, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

import { clearAuthSession, getAuthSession } from "../api/auth";
import Sidebar from "../components/Sidebar";
import { menuParoquiaItems } from "../config/MenuParoquia";

export default function ParoquiaPage() {
  const navigate = useNavigate();

  const session = getAuthSession();

  //VERIFICA SESSAO AO ENTRAR NA PAGINA-----
  if (!session) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  //retorna um boolean em canAcessThisParish
  const canAccessThisParish = session.abilities.includes(
    `parish:${session.parish?.id}`,
  );

  if (canAccessThisParish === false) {
    clearAuthSession();
    return <Navigate to="/login/paroquia" replace />;
  }
  //--------------

  const [activeTab, setActiveTab] = useState("geral");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFamilyRegistration, setShowFamilyRegistration] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const userRole = session?.user.system_role;

  const visibleMenuItems = menuParoquiaItems.filter((item) =>
    item.allowedRoles.includes(userRole),
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        return <div>Painel Geral</div>;
      case "nucleos":
        return <div>Núcleos Familiares</div>;
      case "estoque":
        return <div>Estoque Paroquial</div>;
      case "visitas":
        return <div>Visitas Domiciliares</div>;
      case "prestacao":
        return <div>Prestação de Contass</div>;
      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <div className="size-full flex bg-background">
      <aside
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary-foreground rounded-lg flex-shrink-0">
              <Heart className="w-6 h-6 text-sidebar-primary fill-sidebar-primary" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-medium">Cáritas Paroquial</h1>
                <p className="text-xs text-sidebar-foreground/70">
                  {session.user.name}
                </p>
              </div>
            )}
          </div>
        </div>

        <Sidebar
          items={visibleMenuItems}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          collapsed={sidebarCollapsed}
        />

        <div className="p-4 border-t border-sidebar-border">
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
                {visibleMenuItems.find((item) => item.id === activeTab)
                  ?.label ?? "Painel Geral"}
              </h2>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
