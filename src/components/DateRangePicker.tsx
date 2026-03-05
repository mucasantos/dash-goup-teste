import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { enUS, es, pt } from "date-fns/locale"
import { useState } from "react"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  disabledDays?: any
}

export function DateRangePicker({ dateRange, onDateRangeChange, disabledDays }: DateRangePickerProps) {
  const { t, i18n } = useTranslation()
  const [selectedButton, setSelectedButton] = useState<'currentMonth' | 'last30Days' | null>(null)

  const getLocale = () => {
    switch (i18n.language) {
      case "es":
        return es
      case "pt-PT":
        return pt
      default:
        return enUS
    }
  }

  const selectCurrentMonth = () => {
    const today = new Date()
    onDateRangeChange({
      from: startOfMonth(today),
      to: endOfMonth(today),
    })
    setSelectedButton('currentMonth')
  }

  const selectLast30Days = () => {
    const today = new Date()
    onDateRangeChange({
      from: subDays(today, 30),
      to: today,
    })
    setSelectedButton('last30Days')
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={`w-[300px] justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{t("dateRangePicker.pickDateRange")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={getLocale()}
            weekStartsOn={1}
            disabled={disabledDays}
            classNames={{
              day_selected: "bg-primary text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              day_range_end: "aria-selected:bg-primary aria-selected:text-primary-foreground",
              day_range_start: "aria-selected:bg-primary aria-selected:text-primary-foreground",
            }}
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant={selectedButton === 'currentMonth' ? "default" : "outline"}
        size="sm" 
        onClick={selectCurrentMonth}
      >
        {t("dateRangePicker.currentMonth")}
      </Button>
      
      <Button 
        variant={selectedButton === 'last30Days' ? "default" : "outline"}
        size="sm" 
        onClick={selectLast30Days}
      >
        {t("dateRangePicker.last30Days")}
      </Button>
    </div>
  )
}

