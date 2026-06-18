import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import EmDesenvolvimento from "../components/EmDesenvolvimento";
import NucleoFamiliar from "../components/NucleosFamiliares/NucleoFamiliar";
import { clearAuthSession, getAuthSession } from "../api/auth";
import Sidebar from "../components/Sidebar";
import { menuParoquiaItems } from "../config/MenuParoquia";
import VisitaDomiciliar from "../components/VisitaDomiciliar";
import PainelGeralParoquia from "../components/PainelParoquia/PainelGeralParoquia";
import { EstoqueParoquia } from "../components/Estoque";

export default function ParoquiaPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("geral");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const session = getAuthSession();

  if (!session) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  const canAccessThisParish = session.abilities.includes(
    `parish:${session.parish?.id}`,
  );

  if (!canAccessThisParish) {
    clearAuthSession();
    return <Navigate to="/login/paroquia" replace />;
  }

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const userRole = session.user.system_role;

  const visibleMenuItems = menuParoquiaItems.filter((item) =>
    item.allowedRoles.includes(userRole),
  );

  const activeMenuLabel =
    visibleMenuItems.find((item) => item.id === activeTab)?.label ??
    "Painel Geral";

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        return <PainelGeralParoquia onNavigate={setActiveTab} />;
      case "nucleos":
        return <NucleoFamiliar />;

      case "estoque":
        return <EstoqueParoquia />;
      case "visitas":
        return <VisitaDomiciliar />;
      case "prestacao":
        return (
          <EmDesenvolvimento
            title="Prestação de contas"
            description="Esta seção apresentará informações financeiras e registros com linguagem simples e objetiva."
          />
        );
      default:
        return (
          <EmDesenvolvimento
            title="Conteúdo não encontrado"
            description="Volte ao menu principal e escolha uma das opções disponíveis."
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-foreground focus:shadow-lg focus:outline-3 focus:outline-ring"
      >
        Pular para o conteúdo principal
      </a>

      <aside
        className={`flex flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
        aria-label="Navegação da Cáritas Paroquial"
      >
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            {sidebarCollapsed ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-2">
                <BrandLogo
                  variant="symbol"
                  alt="Símbolo da Cáritas Brasileira"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-3">
                <div className="rounded-xl bg-white p-3">
                  <BrandLogo
                    variant="horizontal"
                    alt="Cáritas Brasileira"
                    className="h-12 w-auto"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-sidebar-foreground">
                    {session.user.name}
                  </p>
                  <p className="truncate text-sm text-sidebar-foreground/80">
                    {session.parish?.name ?? "Acesso paroquial"}
                  </p>
                </div>
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

        <div className="border-t border-sidebar-border p-4">
          <button
            type="button"
            onClick={handleLogout}
            aria-label={sidebarCollapsed ? "Sair do sistema" : undefined}
            className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
              sidebarCollapsed ? "justify-center px-3" : "justify-start"
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && <span className="text-base">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Abrir menu lateral" : "Fechar menu lateral"
              }
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cáritas Paroquial
              </p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {activeMenuLabel}
              </h1>
            </div>
          </div>
        </header>

        <main
          id="conteudo-principal"
          className="flex-1 overflow-auto bg-muted/30 p-6"
        >
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
