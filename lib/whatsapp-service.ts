import 'server-only'
import axios from 'axios'

interface WhatsAppConfig {
  baseUrl: string
  instance: string
  apiKey: string
}

interface SendMessageParams {
  number: string
  text: string
}

class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = {
      baseUrl: process.env.WHATSAPP_BASE_URL || '',
      instance: process.env.WHATSAPP_INSTANCE || '',
      apiKey: process.env.WHATSAPP_API_KEY || ''
    }
  }

  async sendMessage(params: SendMessageParams): Promise<boolean> {
    try {
      const { number, text } = params

      // Formatar número (remover caracteres especiais e adicionar código do país se necessário)
      const formattedNumber = this.formatPhoneNumber(number)

      if (!this.config.baseUrl || !this.config.instance || !this.config.apiKey) {
        throw new Error('WhatsApp API configuration is missing. Please set WHATSAPP_BASE_URL, WHATSAPP_INSTANCE and WHATSAPP_API_KEY')
      }

      const response = await axios.post(
        `${this.config.baseUrl}/message/sendText/${this.config.instance}`,
        {
          number: formattedNumber,
          text: text // Alterado para "text" em vez de "textMessage"
        },
        {
          headers: {
            'apikey': this.config.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
        }
      )

      console.log('WhatsApp message sent successfully:', response.data)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove caracteres especiais e espaços
    let formatted = phone.replace(/[\s\-\(\)\.]/g, '')

    // Se não tem código do país, adiciona 55 (Brasil)
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted
    }

    // Remove qualquer + se existir
    formatted = formatted.replace('+', '')

    return formatted
  }

  async sendTicketResolutionNotification(data: {
    ticketId: string
    clientEmail?: string
    attendantName: string
    resolution: string
    phoneNumber: string
  }): Promise<boolean> {
    const message = this.formatResolutionMessage(data)
    return this.sendMessage({
      number: data.phoneNumber,
      text: message
    })
  }

  private formatResolutionMessage(data: {
    ticketId: string
    clientEmail?: string
    attendantName: string
    resolution: string
  }): string {
    const ticketShortId = data.ticketId.slice(-8)
    const currentDate = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const clientLine = data.clientEmail ? `📧 *Cliente:* ${data.clientEmail}\n` : ''

    return `🎉 *Sistema de Suporte*

Chamado *#${ticketShortId}* foi encerrado com sucesso!

${clientLine}👤 *Atendente:* ${data.attendantName}
✅ *Solução:* ${data.resolution}
📅 *Data:* ${currentDate}

Obrigado pelo seu trabalho! 🚀

---
*Mensagem automática do Sistema de Suporte*`
  }
}

export const whatsappService = new WhatsAppService()
