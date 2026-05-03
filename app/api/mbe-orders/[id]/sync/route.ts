import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { MbeClient } from '@/features/mbe-orders/client/MbeClient'
import { MbeOrdersRepository } from '@/features/mbe-orders/repository/MbeOrdersRepository'
import { UpdateMbeOrderUseCase } from '@/features/mbe-orders/use-cases/UpdateMbeOrderUseCase'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const mbeClient = new MbeClient()
    const mbeOrdersRepository = new MbeOrdersRepository()
    const updateMbeOrderUseCase = new UpdateMbeOrderUseCase(mbeClient, mbeOrdersRepository)

    const result = await updateMbeOrderUseCase.execute(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ data: result.order })
  } catch (error) {
    console.error(`Failed to sync MBE order ${id}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
