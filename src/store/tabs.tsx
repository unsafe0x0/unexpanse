"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DashboardTab =
  | "dashboard"
  | "transactions"
  | "categories"
  | "budgets"
  | "analytics"
  | "settings";

interface TabContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export function useTabStore() {
  const context = useContext(TabContext);
  if (!context) throw new Error("useTabStore must be used within TabProvider");
  return context;
}
