"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    DayPicker,
    DayPickerSingleProps,
} from "react-day-picker"
import { format, parse, startOfMonth, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "../../shadcn/ui/button.tsx"

export type CalendarProps = DayPickerSingleProps

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      onSelect,
                      ...props
                  }: CalendarProps) {
    const [selectedMonth, setSelectedMonth] = useState<Date>(
        props.month || new Date()
    )
    const [inputValue, setInputValue] = useState("")
    const [pendingDate, setPendingDate] = useState<Date | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 8) value = value.slice(0, 8)

        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`
        }

        setInputValue(value)

        if (value.length === 10) {
            const parsed = parse(value, "MM/dd/yyyy", new Date())
            if (isValid(parsed)) {
                setPendingDate(parsed)
            } else {
                setPendingDate(null)
            }
        } else {
            setPendingDate(null)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && pendingDate) {
            setSelectedMonth(startOfMonth(pendingDate))
            onSelect?.(pendingDate)
        }
    }

    return (
        <div className="space-y-3 p-3">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="MM/DD/YYYY"
                className="border border-gray-300 text-center rounded-md px-3 py-2 w-full text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <DayPicker
                mode="single"
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                onSelect={onSelect}
                showOutsideDays={showOutsideDays}
                className={cn("p-0", className)}
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                        "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                        props.mode === "range"
                            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                            : "[&:has([aria-selected])]:rounded-md"
                    ),
                    day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_range_start: "day-range-start",
                    day_range_end: "day-range-end",
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside:
                        "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                    ...classNames,
                }}
                components={{
                    IconLeft: ({ className, ...props }) => (
                        <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
                    ),
                    IconRight: ({ className, ...props }) => (
                        <ChevronRight className={cn("h-4 w-4", className)} {...props} />
                    ),
                }}
                {...props}
            />
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
