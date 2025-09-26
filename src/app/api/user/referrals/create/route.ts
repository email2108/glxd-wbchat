import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { telegramService } from '@/lib/telegram'

export async function POST() {
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

    // Generate unique referral code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create referral
    const referral = await db.referral.create({
      data: {
        code,
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    // Notify admin
    await telegramService.sendAdminNotification(
      `User ${user.name || user.id} đã tạo mã giới thiệu mới: ${code}`
    )

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        code: referral.code,
        status: referral.status,
        earnings: referral.earnings,
        createdAt: referral.createdAt
      }
    })

  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}