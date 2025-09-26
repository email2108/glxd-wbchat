import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { telegramService } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { type, contact, referralCode } = await request.json()

    if (!type || type !== 'telegram') {
      return NextResponse.json(
        { success: false, message: 'Chỉ hỗ trợ xác thực Telegram' },
        { status: 400 }
      )
    }

    // For the new flow, we don't need to create user here
    // User will be created when they message the bot
    // Just return success to show the OTP input field
    
    return NextResponse.json({
      success: true,
      message: 'Vui lòng nhắn tin cho bot @glxdshop_bot để nhận mã OTP!'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}