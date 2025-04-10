
import React, { useId, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date?: Date) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  label = "Date",
  placeholder = "Pick a date",
  className,
  disabled = false,
  showLabel = true,
}: DatePickerProps) {
  const id = useId();
  const [localDate, setLocalDate] = useState<Date | undefined>(date);

  const handleSelect = (selectedDate?: Date) => {
    setLocalDate(selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  const dateToUse = date ?? localDate;

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor={id} className="mb-1 block">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "group w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20",
              !dateToUse && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className={cn("truncate", !dateToUse && "text-muted-foreground")}>
              {dateToUse ? format(dateToUse, "PPP") : placeholder}
            </span>
            <CalendarIcon
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateToUse}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
