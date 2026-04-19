"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarBlank } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

interface DatePickerProps {
  id?: string;
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  error?: string;
  className?: string;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  error,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert "YYYY-MM-DD" to Date object
  const dateValue = value ? parseISO(value) : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onChange) {
      // Format back to YYYY-MM-DD in local time
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-border bg-background px-3 py-2",
              !value && "text-muted-foreground",
              error && "border-destructive focus:ring-destructive"
            )}
          >
            <CalendarBlank size={16} className="mr-2 shrink-0" />
            {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-50 bg-card border border-border rounded-xl shadow-lg mt-1"
          align="start"
        >
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
