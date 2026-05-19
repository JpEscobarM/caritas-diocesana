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
    <nav className="flex-1 py-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChangeTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
            activeTab === item.id
              ? "bg-sidebar-accent border-l-4 border-sidebar-primary text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          }`}
          title={collapsed ? item.label : ""}
        >
          <item.icon
            className={`w-5 h-5 flex-shrink-0 ${
              activeTab === item.id ? "text-sidebar-primary" : ""
            }`}
          />
          {!collapsed && <span className="text-sm">{item.label}</span>}
        </button>
      ))}
    </nav>
  );
}
