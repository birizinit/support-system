import 'server-only'
import { NextResponse } from 'next/server'
import { whatsappService } from '@/lib/whatsapp-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketId, clientEmail, attendantName, resolution, phoneNumber } = body || {}

    if (!ticketId || !attendantName || !resolution || !phoneNumber) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const ok = await whatsappService.sendTicketResolutionNotification({
      ticketId,
      clientEmail,
      attendantName,
      resolution,
      phoneNumber,
    })

    return NextResponse.json({ ok })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

