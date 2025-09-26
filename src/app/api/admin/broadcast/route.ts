import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { telegramService } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get all users with Telegram chat IDs
    const users = await db.user.findMany({
      where: {
        telegramChatId: {
          not: null
        }
      },
      select: {
        telegramChatId: true,
        name: true
      }
    })

    let successCount = 0
    let failureCount = 0

    // Send message to each user
    for (const user of users) {
      if (user.telegramChatId) {
        const sent = await telegramService.sendMessage({
          chat_id: user.telegramChatId,
          text: `📢 *Thông báo từ GLXD Admin*\n\n${message}\n\n---\nGLXD System`,
          parse_mode: 'Markdown'
        })

        if (sent) {
          successCount++
        } else {
          failureCount++
        }
      }
    }

    // Notify admin about broadcast results
    await telegramService.sendAdminNotification(
      `Broadcast completed: ${successCount} successful, ${failureCount} failed`
    )

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${successCount} users`,
      stats: {
        total: users.length,
        success: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}