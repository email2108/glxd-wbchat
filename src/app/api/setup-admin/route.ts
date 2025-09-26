import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { telegramChatId, adminSecret } = await request.json()

    // Check for admin secret key for security
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'glxd-admin-2024'
    
    if (!telegramChatId || !adminSecret) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin cần thiết' },
        { status: 400 }
      )
    }

    if (adminSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Mã bí mật không hợp lệ' },
        { status: 401 }
      )
    }

    // Find user by telegramChatId
    let user = await db.user.findFirst({
      where: { telegramChatId: telegramChatId.toString() }
    })

    // If user doesn't exist, create one
    if (!user) {
      user = await db.user.create({
        data: {
          telegramChatId: telegramChatId.toString(),
          name: `Admin_${telegramChatId}`,
          role: 'USER' // Will be updated to ADMIN below
        }
      })
    }

    // Update user role to ADMIN
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })

    return NextResponse.json({
      success: true,
      message: `Đã thiết lập ${telegramChatId} làm ADMIN thành công!`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        telegramChatId: updatedUser.telegramChatId,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API để thiết lập ADMIN đầu tiên cho hệ thống',
    usage: {
      method: 'POST',
      body: {
        telegramChatId: 'string (bắt buộc) - Chat ID của Telegram',
        adminSecret: 'string (bắt buộc) - Mã bí mật để xác thực'
      },
      note: 'Mã bí mật mặc định là "glxd-admin-2024" hoặc giá trị của biến môi trường ADMIN_SETUP_SECRET'
    }
  })
}