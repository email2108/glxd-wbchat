import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { telegramChatId, targetRole } = await request.json()

    if (!telegramChatId || !targetRole) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin cần thiết' },
        { status: 400 }
      )
    }

    if (targetRole !== 'USER' && targetRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Vai trò không hợp lệ' },
        { status: 400 }
      )
    }

    // Find user by telegramChatId
    const user = await db.user.findFirst({
      where: { telegramChatId: telegramChatId.toString() }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role: targetRole }
    })

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật vai trò của ${user.name || user.telegramChatId} thành ${targetRole}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        telegramChatId: updatedUser.telegramChatId,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Promote user error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API để cấp quyền cho người dùng',
    usage: {
      method: 'POST',
      body: {
        telegramChatId: 'string (bắt buộc)',
        targetRole: 'USER|ADMIN (bắt buộc)'
      }
    }
  })
}