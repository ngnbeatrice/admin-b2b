import { Resend } from 'resend'

import type { EmailMessage } from './EmailMessage'

export class ResendEmailClient {
  private readonly resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY || 're_eLYwCsED_PgMytCmusDFv7mYBLisimUsW'
    this.resend = new Resend(apiKey)
  }

  async sendOrderConfirmation(message: EmailMessage): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: message.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
        })),
      })
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error('Failed to send order confirmation email')
    }
  }
}
