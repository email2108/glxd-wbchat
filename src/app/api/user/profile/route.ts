import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// In a real app, you would get the user ID from the session/JWT
// For demo purposes, we'll get the first user
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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        telegramChatId: user.telegramChatId,
        role: user.role,
        createdAt: user.createdAt,
      }
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}