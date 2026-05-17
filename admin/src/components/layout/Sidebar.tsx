import {
  ALL_KAUCIM_CONCERNS,
  formatKaucimConcernLabel,
} from "@/components/KaucimConcernSelector";
import { cn } from "@/lib/utils";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Home,
  Languages,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Localization",
    href: "/localization",
    icon: Languages,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

const subNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center rounded-lg py-2 pl-9 pr-3 text-sm transition-colors",
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export function Sidebar() {
  const location = useLocation();
  const isKaucimSection = location.pathname.startsWith("/kaucim-stories");
  const [kaucimExpanded, setKaucimExpanded] = useState(isKaucimSection);

  useEffect(() => {
    if (isKaucimSection) {
      setKaucimExpanded(true);
    }
  }, [isKaucimSection]);

  return (
    <div className="flex h-full flex-col border-r bg-muted/10">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold">CalyxGuru</h2>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <NavLink to="/dashboard" className={navLinkClassName}>
          <Home className="h-5 w-5" />
          Dashboard
        </NavLink>

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setKaucimExpanded((open) => !open)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isKaucimSection
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-expanded={kaucimExpanded}
          >
            <Book className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">Kaucim Stories</span>
            {kaucimExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
            )}
          </button>

          {kaucimExpanded && (
            <div className="space-y-0.5">
              {ALL_KAUCIM_CONCERNS.map((concern) => (
                <NavLink
                  key={concern}
                  to={`/kaucim-stories/${concern}`}
                  className={subNavLinkClassName}
                >
                  {formatKaucimConcernLabel(concern)}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {navItems.slice(1).map((item) => (
          <NavLink key={item.href} to={item.href} className={navLinkClassName}>
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">© 2026 CalyxGuru Admin</p>
      </div>
    </div>
  );
}
