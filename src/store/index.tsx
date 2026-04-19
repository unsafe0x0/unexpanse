"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// --- Toast Context ---
interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastStore() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToastStore must be used within ToastProvider");
  return context;
}

// --- Sidebar Context ---
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarStore() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebarStore must be used within SidebarProvider");
  return context;
}

// --- Tab Context (SPA Navigation) ---
export type DashboardTab = "dashboard" | "transactions" | "categories" | "budgets" | "analytics" | "settings";

interface TabContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabStore() {
  const context = useContext(TabContext);
  if (!context) throw new Error("useTabStore must be used within TabProvider");
  return context;
}
