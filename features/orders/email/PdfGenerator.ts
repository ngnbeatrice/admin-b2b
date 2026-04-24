import puppeteer from 'puppeteer'

import type { Order } from '../use-cases/domain/Order'

import { emailTranslations } from './translations'

export class PdfGenerator {
  async generateOrderPdf(order: Order): Promise<Buffer> {
    const t = emailTranslations[order.emailLanguage]
    const locale = order.emailLanguage === 'fr' ? 'fr-FR' : 'en-US'

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()

      const itemsRows = order.items
        .map(
          (item) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e8ddd8;">
              <strong style="color: #2c2420;">${item.productTitle}</strong><br/>
              <span style="color: #9c8880; font-size: 14px;">${item.variantTitle}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e8ddd8; text-align: center; color: #2c2420; font-weight: 600;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e8ddd8; text-align: right; color: #6b5c52;">
              ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(item.price)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e8ddd8; text-align: right; font-weight: 600; color: #7c6a5e;">
              ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(item.total)}
            </td>
          </tr>
        `
        )
        .join('')

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #2c2420;
                padding: 40px;
              }
              .header {
                background: linear-gradient(135deg, #7c6a5e 0%, #a89080 100%);
                color: white;
                padding: 40px;
                border-radius: 12px;
                margin-bottom: 30px;
                text-align: center;
              }
              .header h1 { font-size: 32px; margin-bottom: 10px; text-transform: uppercase; }
              .header p { font-size: 16px; opacity: 0.9; }
              .info-section {
                background-color: #faf7f5;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #7c6a5e;
              }
              .info-section p { margin: 8px 0; }
              .info-section strong { color: #7c6a5e; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background: white;
                box-shadow: 0 1px 3px rgba(44, 36, 32, 0.1);
                border-radius: 8px;
                overflow: hidden;
              }
              thead {
                background-color: #7c6a5e;
                color: white;
              }
              th {
                padding: 16px 12px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              tbody tr:hover {
                background-color: #faf7f5;
              }
              .total-section {
                background-color: #faf7f5;
                padding: 24px;
                border-radius: 8px;
                margin-top: 30px;
                border: 2px solid #7c6a5e;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 12px 0;
              }
              .total-row.grand-total {
                font-size: 24px;
                font-weight: bold;
                color: #7c6a5e;
                padding-top: 12px;
                border-top: 2px solid #7c6a5e;
                margin-top: 12px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e8ddd8;
                text-align: center;
                color: #9c8880;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${t.orderConfirmation}</h1>
              <p>${t.thankYou}</p>
            </div>

            <div class="info-section">
              <p><strong>${t.customerEmail}:</strong> ${order.customerEmail}</p>
              <p><strong>${t.orderDate}:</strong> ${order.formattedDate}</p>
              <p><strong>${t.orderId}:</strong> #${Date.now()}</p>
            </div>

            <h2 style="margin-bottom: 20px; color: #7c6a5e;">${t.orderDetails}</h2>
            
            <table>
              <thead>
                <tr>
                  <th>${t.product}</th>
                  <th style="text-align: center;">${t.quantity}</th>
                  <th style="text-align: right;">${t.unitPrice}</th>
                  <th style="text-align: right;">${t.total}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span>${t.totalItems}:</span>
                <span><strong>${order.items.length}</strong></span>
              </div>
              <div class="total-row">
                <span>${t.totalQuantity}:</span>
                <span><strong>${order.totalQuantity}</strong></span>
              </div>
              <div class="total-row grand-total">
                <span>${t.totalOrder.toUpperCase()}:</span>
                <span>${order.formattedTotal}</span>
              </div>
            </div>

            <div class="footer">
              <p>${t.automatedDocument} ${new Date().toLocaleString(locale)}</p>
              <p>${t.contactSupport}</p>
            </div>
          </body>
        </html>
      `

      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }
}
