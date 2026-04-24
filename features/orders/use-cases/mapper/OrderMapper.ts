import type { EmailMessage } from '../../email/EmailMessage'
import { emailTranslations } from '../../email/translations'
import type { OrderEntity, OrderWithItemsEntity } from '../../repository'
import { Order } from '../domain/Order'
import type { SendOrderRequest } from '../SendOrderRequest'
import type { GetAllOrdersViewModel } from '../user-view/GetAllOrdersViewModel'
import type { GetOrderDetailViewModel } from '../user-view/GetOrderDetailViewModel'

export class OrderMapper {
  /** Request → Domain */
  static toDomain(request: SendOrderRequest): Order {
    const items = request.items.map((item) => ({
      ...item,
      total: item.quantity * item.price,
    }))

    return new Order(
      request.customerEmail,
      request.emailLanguage,
      items,
      request.totalQuantity,
      request.totalAmount,
      new Date()
    )
  }

  /** Domain → Email Message */
  static toEmailMessage(order: Order, pdfBuffer: Buffer): EmailMessage {
    const t = emailTranslations[order.emailLanguage]
    const locale = order.emailLanguage === 'fr' ? 'fr-FR' : 'en-US'

    const itemsList = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 16px; border-bottom: 1px solid #e8ddd8;">
              <div style="display: flex; align-items: center; gap: 16px;">
                ${
                  item.productImage
                    ? `<img src="${item.productImage}" alt="${item.productTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e8ddd8;" />`
                    : `<div style="width: 80px; height: 80px; background-color: #faf7f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #e8ddd8;">
                         <span style="color: #7c6a5e; font-size: 12px; text-align: center;">${t.noImage}</span>
                       </div>`
                }
                <div>
                  <strong style="color: #2c2420; font-size: 16px;">${item.productTitle}</strong><br/>
                  <span style="color: #9c8880; font-size: 14px;">${item.variantTitle}</span>
                </div>
              </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e8ddd8; text-align: center; color: #2c2420; font-weight: 600;">${item.quantity}</td>
            <td style="padding: 16px; border-bottom: 1px solid #e8ddd8; text-align: right; color: #6b5c52;">
              ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(item.price)}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e8ddd8; text-align: right; font-weight: 600; color: #7c6a5e;">
              ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(item.total)}
            </td>
          </tr>`
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              line-height: 1.6; 
              color: #2c2420; 
              background-color: #faf7f5;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 650px; 
              margin: 40px auto; 
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(44, 36, 32, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #7c6a5e 0%, #a89080 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 32px; 
              font-weight: 700;
            }
            .header p { 
              margin: 0; 
              font-size: 16px; 
              opacity: 0.95;
            }
            .content { 
              background-color: #ffffff; 
              padding: 40px 30px;
            }
            .content p { 
              color: #6b5c52; 
              margin: 0 0 16px 0;
            }
            .info-box {
              background-color: #faf7f5;
              border-left: 4px solid #7c6a5e;
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 4px;
            }
            .info-box p {
              margin: 8px 0;
              color: #2c2420;
            }
            .info-box strong {
              color: #7c6a5e;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0;
              border-radius: 8px;
              overflow: hidden;
            }
            th { 
              background-color: #7c6a5e;
              color: white;
              padding: 16px 12px; 
              text-align: left; 
              font-weight: 600; 
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            tbody tr:last-child td {
              border-bottom: none;
            }
            .total-row { 
              background-color: #faf7f5; 
              font-weight: bold; 
              font-size: 18px;
            }
            .total-row td {
              padding: 20px 16px !important;
              border-bottom: none !important;
            }
            .footer { 
              background-color: #faf7f5; 
              padding: 24px 30px; 
              text-align: center; 
              color: #9c8880; 
              font-size: 14px;
              border-top: 2px solid #e8ddd8;
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${t.orderConfirmation}</h1>
              <p>${t.thankYou}</p>
            </div>
            <div class="content">
              <p>${t.hello}</p>
              <p>${t.receivedMessage}</p>
              
              <div class="info-box">
                <p><strong>${t.orderDate}:</strong> ${order.formattedDate}</p>
                <p><strong>${t.customerEmail}:</strong> ${order.customerEmail}</p>
                <p><strong>${t.totalItems}:</strong> ${order.items.length}</p>
                <p><strong>${t.totalQuantity}:</strong> ${order.totalQuantity}</p>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>${t.product}</th>
                    <th style="text-align: center; width: 100px;">${t.quantity}</th>
                    <th style="text-align: right; width: 120px;">${t.unitPrice}</th>
                    <th style="text-align: right; width: 120px;">${t.total}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; color: #2c2420;">${t.totalOrder}:</td>
                    <td style="text-align: right; color: #7c6a5e;">${order.formattedTotal}</td>
                  </tr>
                </tbody>
              </table>
              
              <p style="margin-top: 30px;">${t.pdfAttached}</p>
              <p>${t.questions}</p>
            </div>
            <div class="footer">
              <p>${t.automatedEmail}</p>
              <p style="margin-top: 12px; font-size: 12px; color: #9c8880;">© ${new Date().getFullYear()} - ${t.allRightsReserved}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return {
      to: order.customerEmail,
      subject: `${t.orderConfirmation} - ${order.formattedDate}`,
      html,
      attachments: [
        {
          filename: `order-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
    }
  }

  /** Entity → GetAllOrders view model */
  static toGetAllOrdersViewModel(entity: OrderEntity): GetAllOrdersViewModel {
    return {
      id: entity.id,
      customerEmail: entity.customerEmail,
      totalQuantity: entity.totalQuantity,
      totalAmount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(entity.totalAmount),
      paid: entity.paid,
      status: entity.status,
      createdAt: entity.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdBy: entity.createdBy,
    }
  }

  /** Entity with items → GetOrderDetail view model */
  static toGetOrderDetailViewModel(entity: OrderWithItemsEntity): GetOrderDetailViewModel {
    return {
      id: entity.id,
      customerEmail: entity.customerEmail,
      totalQuantity: entity.totalQuantity,
      totalAmount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(entity.totalAmount),
      paid: entity.paid,
      status: entity.status,
      createdAt: entity.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdBy: entity.createdBy,
      items: entity.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle,
        productImageUrl: item.productImageUrl,
        variantId: item.variantId,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(item.unitPrice),
        totalPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(item.totalPrice),
      })),
    }
  }
}
