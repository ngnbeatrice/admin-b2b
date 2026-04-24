import { PdfGenerator } from '../email/PdfGenerator'
import { ResendEmailClient } from '../email/ResendEmailClient'

import { OrderMapper } from './mapper/OrderMapper'
import type { SendOrderRequest } from './SendOrderRequest'

export class SendOrderUseCase {
  constructor(
    private readonly emailClient: ResendEmailClient,
    private readonly pdfGenerator: PdfGenerator
  ) {}

  async execute(request: SendOrderRequest): Promise<void> {
    // Map request to domain
    const order = OrderMapper.toDomain(request)

    // Generate PDF
    const pdfBuffer = await this.pdfGenerator.generateOrderPdf(order)

    // Map domain to email message
    const emailMessage = OrderMapper.toEmailMessage(order, pdfBuffer)

    // Send email
    await this.emailClient.sendOrderConfirmation(emailMessage)
  }
}
