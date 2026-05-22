import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  allowedRoles: string[];
};

type SidebarProps = {
  items: SidebarItem[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  collapsed: boolean;
};

export default function Sidebar({
  items,
  activeTab,
  onChangeTab,
  collapsed,
}: SidebarProps) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Menu principal">
      {items.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeTab(item.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={`min-h-12 w-full rounded-xl flex items-center gap-3 px-4 py-3 text-left font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-foreground/10"
            } ${collapsed ? "justify-center px-3" : "justify-start"}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon
              aria-hidden="true"
              className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : ""}`}
            />
            {!collapsed && <span className="text-base leading-snug">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
