"use client";

import { useToastStore } from "@/store";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Warning, Info, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const toastIcons = {
  success: <CheckCircle size={16} weight="fill" className="text-emerald-500" />,
  error:   <XCircle   size={16} weight="fill" className="text-red-500" />,
  warning: <Warning   size={16} weight="fill" className="text-amber-500" />,
  info:    <Info      size={16} weight="fill" className="text-blue-500" />,
};

const toastBorder = {
  success: "border-emerald-500/20",
  error: "border-red-500/20",
  warning: "border-amber-500/20",
  info: "border-blue-500/20",
};

interface ToastItemProps {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
}

function ToastItem({ id, title, description, type }: ToastItemProps) {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(id), 200);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full max-w-sm rounded-xl border bg-card p-4 shadow-lg",
        "transition-all duration-200",
        toastBorder[type],
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      )}
    >
      <div className="shrink-0 mt-0.5">{toastIcons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div
      aria-live="polite"
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}

export function useToast() {
  const { addToast } = useToastStore();
  return {
    toast: {
      success: (title: string, description?: string) =>
        addToast({ type: "success", title, description }),
      error: (title: string, description?: string) =>
        addToast({ type: "error", title, description }),
      warning: (title: string, description?: string) =>
        addToast({ type: "warning", title, description }),
      info: (title: string, description?: string) =>
        addToast({ type: "info", title, description }),
    },
  };
}
