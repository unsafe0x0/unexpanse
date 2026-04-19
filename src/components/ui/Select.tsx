"use client";

import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  label,
  error,
  disabled,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "Enter" || e.key === " ") setIsOpen((o) => !o);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen((o) => !o)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-border",
            "bg-background px-3 py-2 text-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive",
            !selected && "text-muted-foreground/60"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.icon}
            {selected?.label ?? placeholder}
          </span>
          <CaretDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl overflow-hidden">
            <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                    "hover:bg-accent transition-colors duration-100",
                    option.value === value && "bg-accent font-medium"
                  )}
                >
                  {option.icon}
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
