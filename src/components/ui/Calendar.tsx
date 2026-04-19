"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-card text-foreground", className)}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <CaretLeft className="h-4 w-4" />;
          return <CaretRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
