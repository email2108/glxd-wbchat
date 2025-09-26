import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [totalUsers, totalOTPs, todayOTPs] = await Promise.all([
      db.user.count(),
      db.oTP.count(),
      db.oTP.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    // Calculate active users (users with OTP in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = await db.user.count({
      where: {
        otps: {
          some: {
            createdAt: {
              gte: sevenDaysAgo
            }
          }
        }
      }
    })

    const stats = {
      totalUsers,
      totalOTPs,
      activeUsers,
      todayOTPs
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}