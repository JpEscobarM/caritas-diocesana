import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import EmDesenvolvimento from "../components/EmDesenvolvimento";
import NucleoFamiliar from "../components/NucleosFamiliares/NucleoFamiliar";
import { clearAuthSession, getAuthSession } from "../api/auth";
import Sidebar from "../components/Sidebar";
import MobileBottomNavigation from "../components/MobileBottomNavigation";
import { menuParoquiaItems } from "../config/MenuParoquia";
import VisitaDomiciliar from "../components/VisitaDomiciliar";
import PainelGeralParoquia from "../components/PainelParoquia/PainelGeralParoquia";
import {
  EstoqueConsultaParoquias,
  EstoqueParoquia,
} from "../components/Estoque";
import type { AuthSession, Parish, ParishRole } from "../types/types";

const PARISH_ROLES: ParishRole[] = ["member", "admin", "admin_no_visits"];

function isParishRole(role: string | null | undefined): role is ParishRole {
  return PARISH_ROLES.includes(role as ParishRole);
}

function getCurrentParishRole(session: AuthSession): ParishRole | null {
  const parishId = session.parish?.id;
  const selectedParish = session.parish as (Parish & { role?: string }) | null;
  const role =
    session.parish_role ??
    session.user.parish_role ??
    session.user.parishes?.find((parish) => parish.id === parishId)?.role ??
    selectedParish?.role ??
    null;

  return isParishRole(role) ? role : null;
}

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
  const parishRole = getCurrentParishRole(session);
  const effectiveParishRole = parishRole ?? "admin_no_visits";
  const canViewVisits = effectiveParishRole !== "admin_no_visits";

  const visibleMenuItems = menuParoquiaItems.filter((item) => {
    const hasSystemRole = item.allowedRoles.includes(userRole);
    const hasParishRole =
      !item.allowedParishRoles ||
      item.allowedParishRoles.includes(effectiveParishRole) ||
      (userRole === "diocese_admin" && parishRole === null);

    return hasSystemRole && hasParishRole;
  });

  const visibleMenuIds = new Set(visibleMenuItems.map((item) => item.id));
  const activeMenuId = visibleMenuIds.has(activeTab)
    ? activeTab
    : visibleMenuItems[0]?.id ?? "sem-acesso";
  const activeMenuLabel =
    visibleMenuItems.find((item) => item.id === activeMenuId)?.label ??
    "Acesso restrito";

  const handleChangeTab = (tabId: string) => {
    if (visibleMenuIds.has(tabId)) {
      setActiveTab(tabId);
    }
  };

  const renderTabContent = () => {
    switch (activeMenuId) {
      case "geral":
        return (
          <PainelGeralParoquia
            onNavigate={handleChangeTab}
            canViewVisits={canViewVisits}
          />
        );
      case "nucleos":
        return <NucleoFamiliar />;
      case "estoque":
        return <EstoqueParoquia />;
      case "paroquias":
        return <EstoqueConsultaParoquias />;
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
            title="Acesso restrito"
            description="Seu perfil nesta paróquia não possui permissão para acessar este módulo."
          />
        );
    }
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-foreground">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-foreground focus:shadow-lg focus:outline-3 focus:outline-ring"
      >
        Pular para o conteúdo principal
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-dvh flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
        aria-label="Navegação da Cáritas Paroquial"
      >
        <div className="shrink-0 border-b border-sidebar-border p-4">
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar
            items={visibleMenuItems}
            activeTab={activeMenuId}
            onChangeTab={handleChangeTab}
            collapsed={sidebarCollapsed}
          />
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-4">
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

      <div
        className={`flex h-dvh min-w-0 flex-col transition-[margin] duration-200 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-3 sm:px-4 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Abrir menu lateral" : "Fechar menu lateral"
              }
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring md:flex"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
                Cáritas Paroquial
              </p>
              <h1 className="caritas-mobile-safe text-lg font-bold text-foreground sm:text-2xl md:text-3xl">
                {activeMenuLabel}
              </h1>
            </div>
          </div>
        </header>

        <main
          id="conteudo-principal"
          className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-3 pb-28 sm:p-4 md:p-6 md:pb-6"
        >
          {renderTabContent()}
        </main>
      </div>

      <MobileBottomNavigation
        items={visibleMenuItems}
        activeTab={activeMenuId}
        onChangeTab={handleChangeTab}
        onLogout={handleLogout}
        ariaLabel="Menu inferior da Cáritas Paroquial"
      />
    </div>
  );
}
