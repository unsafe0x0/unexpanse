"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebarStore() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebarStore must be used within SidebarProvider");
  return context;
}
