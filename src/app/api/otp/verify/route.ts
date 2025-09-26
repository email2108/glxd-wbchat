import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { telegramService } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { type, contact, code } = await request.json()

    if (!type || type !== 'telegram' || !code) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin cần thiết' },
        { status: 400 }
      )
    }

    // For the new flow, we need to find the OTP by code only
    // since we don't have the contact info beforehand
    const otpRecord = await db.oTP.findFirst({
      where: {
        code: code,
        type: 'TELEGRAM',
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await db.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Update user last login
    await db.user.update({
      where: { id: otpRecord.user.id },
      data: { updatedAt: new Date() },
    })

    // Notify admin
    await telegramService.sendAdminNotification(
      `User ${otpRecord.user.name || otpRecord.user.id} đã xác thực OTP thành công qua Telegram`
    )

    // Create session token (in real app, use proper JWT)
    const sessionToken = Buffer.from(`${otpRecord.user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      message: 'Xác thực thành công',
      user: {
        id: otpRecord.user.id,
        name: otpRecord.user.name,
        telegramChatId: otpRecord.user.telegramChatId,
        role: otpRecord.user.role,
      },
      sessionToken,
      role: otpRecord.user.role
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}