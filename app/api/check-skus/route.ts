import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import { ShopifyClient } from '@/features/products/client/ShopifyClient'
import { CheckSkuListUseCase } from '@/features/products/use-cases/CheckSkuListUseCase'

const BodySchema = z.object({
  skus: z.array(z.string().min(1)).min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const results = await new CheckSkuListUseCase(new ShopifyClient()).execute(parsed.data.skus)
  return NextResponse.json({ data: results })
}
