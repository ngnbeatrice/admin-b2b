import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import {
  ApplicationPropertiesRepository,
  ApplicationPropertiesService,
} from '@/features/app-properties'
import {
  GetAllMbeOrdersUseCase,
  GetMbeOrderListService,
  MbeClient,
  MbeOrdersRepository,
} from '@/features/mbe-orders'
import { hasScopes } from '@/lib/auth-utils'

import { MbeOrderHistoryScreen } from './_components/MbeOrderHistoryScreen'
import { MbeOrderHistorySkeleton } from './_components/MbeOrderHistorySkeleton'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ 'date-from'?: string; 'date-to'?: string; sku?: string }>
}

async function MbeOrderHistoryData({
  searchParams,
}: {
  searchParams: { 'date-from'?: string; 'date-to'?: string; sku?: string }
}) {
  const mbeClient = new MbeClient()
  const service = new GetMbeOrderListService(mbeClient)
  const repository = new MbeOrdersRepository()
  const appPropertiesRepository = new ApplicationPropertiesRepository()
  const appPropertiesService = new ApplicationPropertiesService(appPropertiesRepository)
  const useCase = new GetAllMbeOrdersUseCase(service, repository, appPropertiesService)

  // If SKU is provided without dates, query by SKU only
  if (searchParams.sku && !searchParams['date-from'] && !searchParams['date-to']) {
    const result = await useCase.execute({
      sku: searchParams.sku,
    })

    const key = `sku-${searchParams.sku}`

    return (
      <MbeOrderHistoryScreen
        key={key}
        initialData={result}
        dateFrom={undefined}
        dateTo={undefined}
        initialSku={searchParams.sku}
      />
    )
  }

  // Calculate date range: use URL params or default to last 18 months (1.5 years)
  const today = new Date()
  const eighteenMonthsAgo = new Date(today)
  eighteenMonthsAgo.setMonth(today.getMonth() - 18)

  const dateFrom = searchParams['date-from']
    ? new Date(searchParams['date-from']).toISOString().split('T')[0]
    : eighteenMonthsAgo.toISOString().split('T')[0]

  const dateTo = searchParams['date-to']
    ? new Date(searchParams['date-to']).toISOString().split('T')[0]
    : today.toISOString().split('T')[0]

  const result = await useCase.execute({
    date_from: dateFrom,
    date_to: dateTo,
  })

  // Use a key that changes when dates change to force remount
  const key = `${dateFrom}-${dateTo}`

  return (
    <MbeOrderHistoryScreen key={key} initialData={result} dateFrom={dateFrom} dateTo={dateTo} />
  )
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  const resolvedSearchParams = await searchParams

  // If SKU is provided, allow rendering without dates
  if (resolvedSearchParams.sku) {
    return (
      <Suspense fallback={<MbeOrderHistorySkeleton />}>
        <MbeOrderHistoryData searchParams={resolvedSearchParams} />
      </Suspense>
    )
  }

  // If no date params are provided, redirect to URL with default date range BEFORE rendering
  if (!resolvedSearchParams['date-from'] && !resolvedSearchParams['date-to']) {
    const today = new Date()
    const eighteenMonthsAgo = new Date(today)
    eighteenMonthsAgo.setMonth(today.getMonth() - 18)

    const dateFrom = eighteenMonthsAgo.toISOString().split('T')[0]
    const dateTo = today.toISOString().split('T')[0]

    redirect(`/${locale}/b2b/mbe-order-history?date-from=${dateFrom}&date-to=${dateTo}`)
  }

  return (
    <Suspense fallback={<MbeOrderHistorySkeleton />}>
      <MbeOrderHistoryData searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
