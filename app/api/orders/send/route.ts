import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import {
  SendOrderUseCase,
  CreateOrderUseCase,
  ResendEmailClient,
  PdfGenerator,
  OrderRepository,
  type SendOrderRequest,
} from '@/features/orders'

const OrderItemSchema = z.object({
  productId: z.string(),
  productTitle: z.string(),
  productImage: z.string().nullable(),
  variantId: z.string(),
  variantTitle: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
})

const SendOrderSchema = z.object({
  customerEmail: z.string().email(),
  emailLanguage: z.enum(['en', 'fr']).default('fr'),
  items: z.array(OrderItemSchema).min(1),
  totalQuantity: z.number().int().positive(),
  totalAmount: z.number().positive(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = SendOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const request: SendOrderRequest = parsed.data

    // Save order to database
    const createOrderUseCase = new CreateOrderUseCase(new OrderRepository())
    await createOrderUseCase.execute(request, session.user?.email || null)

    // Send email
    const sendOrderUseCase = new SendOrderUseCase(new ResendEmailClient(), new PdfGenerator())
    await sendOrderUseCase.execute(request)

    return NextResponse.json({ success: true, message: 'Order sent successfully' })
  } catch (error) {
    console.error('Error sending order:', error)
    return NextResponse.json(
      {
        error: 'Failed to send order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
