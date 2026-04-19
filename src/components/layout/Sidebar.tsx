"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore, useTabStore, DashboardTab } from "@/store";
import { useEffect } from "react";
import {
  SquaresFour,
  ArrowsLeftRight,
  Tag,
  Target,
  ChartBar,
  Gear,
  CaretLeft,
} from "@phosphor-icons/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const navItems: { section: string, items: { tab: DashboardTab, label: string, icon: any }[] }[] = [
  {
    section: "Overview",
    items: [
      { tab: "dashboard", label: "Dashboard", icon: SquaresFour },
    ],
  },
  {
    section: "Money",
    items: [
      { tab: "transactions", label: "Transactions", icon: ArrowsLeftRight },
      { tab: "categories",   label: "Categories",   icon: Tag },
      { tab: "budgets",      label: "Budgets",      icon: Target },
    ],
  },
  {
    section: "Insights",
    items: [
      { tab: "analytics", label: "Analytics", icon: ChartBar },
      { tab: "settings",  label: "Settings",  icon: Gear },
    ],
  },
];

export function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();
  const { activeTab, setActiveTab } = useTabStore();

  // Only close the mobile drawer on tab change
  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggle}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full flex flex-col bg-card border-r border-border w-65",
          "transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:z-auto",
          isOpen ? "lg:w-17" : "lg:w-65"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-4 border-b border-border shrink-0">
          <span className={cn(
            "text-base font-bold tracking-tight animate-fade-in",
            isOpen ? "lg:hidden" : "block"
          )}>
            unexpanse
          </span>
          <button
            onClick={toggle}
            className={cn(
              "ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent",
              "transition-all duration-200 hidden lg:block",
              isOpen ? "rotate-180" : "rotate-0"
            )}
            aria-label={isOpen ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CaretLeft size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((section) => (
            <div key={section.section} className="mb-6">
              <p className={cn(
                "px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60",
                isOpen ? "lg:hidden" : "block"
              )}>
                {section.section}
              </p>
              <div className="space-y-px">
                {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;

                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={cn(
                      "flex items-center justify-start gap-3 w-full rounded-lg py-2 text-sm font-medium",
                      "transition-all duration-150 group",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      isOpen ? "lg:justify-center lg:px-2 px-3" : "px-3"
                    )}
                    title={isOpen ? item.label : undefined}
                  >
                    <Icon size={18} weight={isActive ? "fill" : "regular"} className="shrink-0" />
                    <span className={cn("animate-fade-in", isOpen ? "lg:hidden" : "block")}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      </aside>
    </>
  );
}
