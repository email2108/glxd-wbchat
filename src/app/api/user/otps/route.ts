import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get the first user for demo
    const user = await db.user.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const otps = await db.oTP.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Last 20 OTPs
    })

    return NextResponse.json({ otps })
  } catch (error) {
    console.error('Get user OTPs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}