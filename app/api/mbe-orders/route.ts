import { NextResponse } from 'next/server'

import { auth } from '@/auth'
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

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const sku = searchParams.get('sku')

  try {
    const mbeClient = new MbeClient()
    const service = new GetMbeOrderListService(mbeClient)
    const repository = new MbeOrdersRepository()
    const appPropertiesRepository = new ApplicationPropertiesRepository()
    const appPropertiesService = new ApplicationPropertiesService(appPropertiesRepository)
    const useCase = new GetAllMbeOrdersUseCase(service, repository, appPropertiesService)

    const result = await useCase.execute({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sku: sku || undefined,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Failed to fetch MBE orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
