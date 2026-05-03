'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MbeOrderState } from '@/features/mbe-orders/domain/MbeOrderState'
import { useRouter, usePathname } from '@/lib/navigation'
import { cn } from '@/lib/utils'

interface MbeOrderHistoryFiltersProps {
  savedCount: number
  skuList: string[]
  skuFilter: string
  onSkuFilterChange: (value: string) => void
  stateFilter: string[]
  onStateFilterChange: (value: string[]) => void
}

export function MbeOrderHistoryFilters({
  savedCount,
  skuList,
  skuFilter,
  onSkuFilterChange,
  stateFilter,
  onStateFilterChange,
}: MbeOrderHistoryFiltersProps) {
  const t = useTranslations('MbeOrderHistoryPage')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Show toast when orders are saved
  useEffect(() => {
    if (savedCount > 0) {
      toast.success(t('ordersSaved', { count: savedCount }))
    }
  }, [savedCount, t])

  // Get dates from URL - no defaults
  const getInitialDates = () => {
    const dateFromParam = searchParams.get('date-from')
    const dateToParam = searchParams.get('date-to')

    return {
      dateFrom: dateFromParam ? new Date(dateFromParam) : undefined,
      dateTo: dateToParam ? new Date(dateToParam) : undefined,
    }
  }

  const initialDates = getInitialDates()
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDates.dateFrom)
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDates.dateTo)

  // Update URL when dates change (but not on initial mount)
  const handleDateChange = (newDateFrom: Date | undefined, newDateTo: Date | undefined) => {
    if (!newDateFrom || !newDateTo) return

    const params = new URLSearchParams(searchParams.toString())
    const newDateFromStr = format(newDateFrom, 'yyyy-MM-dd')
    const newDateToStr = format(newDateTo, 'yyyy-MM-dd')

    // Only update if values actually changed
    if (params.get('date-from') !== newDateFromStr || params.get('date-to') !== newDateToStr) {
      params.set('date-from', newDateFromStr)
      params.set('date-to', newDateToStr)

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    if (date && dateTo) {
      handleDateChange(date, dateTo)
    }
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    if (dateFrom && date) {
      handleDateChange(dateFrom, date)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{t('filters.dateFrom')}</span>
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-[200px] justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground'
              )}
              disabled={isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'PPP') : <span>{t('filters.pickDate')}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={handleDateFromChange}
                initialFocus
                disabled={(date) => (dateTo ? date > dateTo : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{t('filters.dateTo')}</span>
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-[200px] justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground'
              )}
              disabled={isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'PPP') : <span>{t('filters.pickDate')}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={handleDateToChange}
                initialFocus
                disabled={(date) => (dateFrom ? date < dateFrom : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Input
            list="mbe-sku-options"
            placeholder={t('filters.skuPlaceholder')}
            value={skuFilter}
            onChange={(e) => onSkuFilterChange(e.target.value)}
            className="w-56 text-sm"
          />
          <datalist id="mbe-sku-options">
            {skuList.map((sku) => (
              <option key={sku} value={sku} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{t('filters.state')}</span>
        <ToggleGroup
          variant="outline"
          type="multiple"
          value={stateFilter}
          onValueChange={onStateFilterChange}
        >
          <ToggleGroupItem value={String(MbeOrderState.DRAFT)} aria-label="Draft">
            {t('stateDraft')}
          </ToggleGroupItem>
          <ToggleGroupItem value={String(MbeOrderState.CONFIRMED)} aria-label="Confirmed">
            {t('stateConfirmed')}
          </ToggleGroupItem>
          <ToggleGroupItem value={String(MbeOrderState.DELETED)} aria-label="Deleted">
            {t('stateDeleted')}
          </ToggleGroupItem>
          <ToggleGroupItem value={String(MbeOrderState.FULFILLED)} aria-label="Fulfilled">
            {t('stateFulfilled')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
