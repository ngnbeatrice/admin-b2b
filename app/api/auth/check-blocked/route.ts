import { NextResponse } from 'next/server'
import { z } from 'zod'

import { UserRepository } from '@/features/users'

const BodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ blocked: false })
    }

    const user = await new UserRepository().findByEmailWithPassword(parsed.data.email)

    if (!user) {
      return NextResponse.json({ blocked: false })
    }

    return NextResponse.json({
      blocked: user.blockedAt !== null,
      failedAttempts: user.failedLoginAttempts,
    })
  } catch {
    return NextResponse.json({ blocked: false })
  }
}
