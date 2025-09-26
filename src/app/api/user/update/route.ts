import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, phone, username } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu User ID' },
        { status: 400 }
      )
    }

    // Find user by ID
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (phone !== undefined) {
      updateData.phone = phone
    }
    if (username !== undefined) {
      updateData.username = username
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin người dùng thành công',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        phone: updatedUser.phone,
        telegramChatId: updatedUser.telegramChatId,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API để cập nhật thông tin người dùng',
    usage: {
      method: 'POST',
      body: {
        userId: 'string (bắt buộc) - ID của người dùng',
        phone: 'string (tùy chọn) - Số điện thoại',
        username: 'string (tùy chọn) - Username'
      }
    }
  })
}