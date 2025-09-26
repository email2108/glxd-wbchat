import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const otps = await db.oTP.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 records
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json({ otps })
  } catch (error) {
    console.error('Get OTPs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}