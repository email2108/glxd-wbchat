import { NextRequest, NextResponse } from 'next/server'
import { telegramService } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // Process the update
    const result = await telegramService.verifyWebhook(update)
    
    if (result) {
      return NextResponse.json({ ok: true })
    } else {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint is active',
    botToken: process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured'
  })
}