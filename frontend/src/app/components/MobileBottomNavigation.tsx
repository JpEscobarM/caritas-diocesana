import { useEffect, useMemo, useState } from "react";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import type { SidebarItem } from "./Sidebar";

type MobileBottomNavigationProps = {
  items: SidebarItem[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  onLogout: () => void;
  ariaLabel: string;
};

const MAX_PRIMARY_ITEMS = 4;

function getPrimaryMobileItems(items: SidebarItem[]) {
  const selectedItems = items.filter((item) => item.mobilePrimary);
  const remainingItems = items.filter((item) => !selectedItems.includes(item));

  return [...selectedItems, ...remainingItems].slice(0, MAX_PRIMARY_ITEMS);
}

export default function MobileBottomNavigation({
  items,
  activeTab,
  onChangeTab,
  onLogout,
  ariaLabel,
}: MobileBottomNavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryItems = useMemo(() => getPrimaryMobileItems(items), [items]);
  const primaryItemIds = useMemo(
    () => new Set(primaryItems.map((item) => item.id)),
    [primaryItems],
  );
  const isActiveInMore = !primaryItemIds.has(activeTab);

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreOpen]);

  const handleChangeTab = (tabId: string) => {
    onChangeTab(tabId);
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden"
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${primaryItems.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {primaryItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChangeTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-xs font-bold leading-tight transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="line-clamp-2">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMoreOpen}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-xs font-bold leading-tight transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              isActiveInMore
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {isMoreOpen && (
        <div className="fixed inset-0 z-[95] md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-black/40"
            onClick={() => setIsMoreOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Todas as opções do menu"
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <p className="text-sm text-muted-foreground">
                  Escolha uma área do sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Fechar menu"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[calc(85dvh-6rem)] overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4">
              <div className="grid gap-2">
                {items.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChangeTab(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-base font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-2 flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left text-base font-bold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
