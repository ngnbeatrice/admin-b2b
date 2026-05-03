import type { MbeOrderDTO } from '../client/dto/MbeOrderDTO'
import type { MbeOrder } from '../domain/MbeOrder'
import type { MbeOrderState } from '../domain/MbeOrderState'
import type { MbeOrdersEntity } from '../repository/entity/MbeOrdersEntity'
import type {
  GetAllMbeOrdersResult,
  GetAllMbeOrdersViewModel,
} from '../use-cases/user-view/GetAllMbeOrdersViewModel'
import type { GetMbeOrderDetailViewModel } from '../use-cases/user-view/GetMbeOrderDetailViewModel'

export class MbeOrderMapper {
  /** MBE Order DTO → Domain object */
  static toDomain(dto: MbeOrderDTO): MbeOrder {
    return {
      id: dto.shipping_order.id,
      num: dto.shipping_order.num,
      deposit: dto.shipping_order.deposit,
      department_id: dto.shipping_order.department_id,
      date: dto.shipping_order.date,
      reason: dto.shipping_order.reason,
      transport: dto.shipping_order.transport,
      port_shipment: dto.shipping_order.port_shipment,
      note: dto.shipping_order.note,
      operator: dto.shipping_order.operator,
      shipping_packages: dto.shipping_order.shipping_packages,
      tracking_number: dto.shipping_order.tracking_number,
      tracking_number_mbe: dto.shipping_order.tracking_number_mbe,
      state: dto.shipping_order.state as MbeOrderState,
      state_description: dto.shipping_order.state_description,
      working_state: dto.shipping_order.working_state,
      working_state_description: dto.shipping_order.working_state_description,
      creation_time: dto.shipping_order.creation_time,
      recipient: dto.shipping_order.recipient,
      destination: dto.shipping_order.destination,
      products: dto.shipping_order.products.filter((product) => product.state !== 2),
    }
  }

  /** Entity (DB row) → Domain object */
  static mapEntityToDomain(entity: MbeOrdersEntity): MbeOrder {
    const recipient = entity.recipient as {
      id: string
      company_name: string
      first_name: string
      vat_number: string | null
      tax_code: string | null
      address: string
      province: string
      postcode: string
      city: string
      country: string
      email: string
      phone: string
    }

    return {
      id: entity.id,
      num: entity.num,
      deposit: entity.deposit,
      department_id: entity.departmentId,
      date: entity.date?.toISOString() ?? null,
      reason: entity.reason,
      transport: entity.transport,
      port_shipment: entity.portShipment,
      note: entity.note,
      operator: entity.operator,
      shipping_packages: entity.shippingPackages,
      tracking_number: entity.trackingNumber,
      tracking_number_mbe: entity.trackingNumberMbe,
      state: entity.state as MbeOrderState | null,
      state_description: entity.stateDescription,
      working_state: entity.workingState,
      working_state_description: entity.workingStateDescription,
      creation_time: entity.creationTime?.toISOString() ?? new Date().toISOString(),
      recipient: {
        id: recipient.id,
        company_name: recipient.company_name,
        first_name: recipient.first_name,
        vat_number: recipient.vat_number,
        tax_code: recipient.tax_code,
        address: recipient.address,
        province: recipient.province,
        postcode: recipient.postcode,
        city: recipient.city,
        country: recipient.country,
        email: recipient.email,
        phone: recipient.phone,
      },
      destination: {
        company_name: '',
        address: '',
        postcode: '',
        city: '',
        province: '',
        country: '',
        email: '',
        phone: '',
      },
      products: entity.products.map((product) => ({
        id: product.productId,
        sku: product.sku,
        description: product.description ?? '',
        qnt: product.quantity,
        lot: '',
        expire_date: '',
        serial: '',
        id_container: null,
        container_name: null,
        id_container_uds: null,
        container_name_uds: null,
        qnt_init: 0,
        qnt_fulfilled: 0,
        state: 0,
        related_doc_id: null,
        related_doc_num: null,
        related_doc_date: null,
      })),
    }
  }

  /** Domain object → Entity (DB row) */
  static mapDomainToEntity(
    domain: MbeOrder
  ): Omit<MbeOrdersEntity, 'mbeOrdersId' | 'createdAt' | 'updatedAt'> {
    return {
      id: domain.id,
      num: domain.num,
      deposit: domain.deposit,
      departmentId: domain.department_id,
      date: domain.date ? new Date(domain.date) : null,
      reason: domain.reason,
      transport: domain.transport,
      portShipment: domain.port_shipment || '',
      note: domain.note,
      operator: domain.operator,
      shippingPackages: domain.shipping_packages ?? 0,
      trackingNumber: domain.tracking_number === 'None' ? null : domain.tracking_number,
      trackingNumberMbe: domain.tracking_number_mbe === 'None' ? null : domain.tracking_number_mbe,
      state: domain.state,
      stateDescription: domain.state_description,
      workingState: domain.working_state,
      workingStateDescription: domain.working_state_description,
      creationTime: new Date(domain.creation_time),
      recipientCompanyName: domain.recipient.company_name,
      recipient: domain.recipient,
      products: domain.products.map((product) => ({
        mbeOrdersProductsId: 0,
        orderId: domain.id,
        productId: product.id,
        sku: product.sku,
        description: product.description,
        quantity: product.qnt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    }
  }

  /** Domain → GetAllMbeOrders view model */
  static toGetAllViewModel(domain: MbeOrder): GetAllMbeOrdersViewModel {
    const totalProducts = domain.products.reduce((sum, product) => sum + product.qnt, 0)
    const productsSku = domain.products
      .map((product) => product.sku)
      .filter((sku): sku is string => sku !== null && sku !== '')

    return {
      id: domain.id,
      num: domain.num ?? '',
      company_name: domain.recipient.company_name,
      creation_time: domain.creation_time,
      tracking_number_mbe: domain.tracking_number_mbe ?? null,
      state: domain.state ?? null,
      state_description: domain.state_description ?? '',
      total_products: totalProducts,
      products_sku: productsSku,
    }
  }

  /** Entity → GetAllMbeOrders view model */
  static mapEntityToViewModel(entity: MbeOrdersEntity): GetAllMbeOrdersViewModel {
    const totalProducts = entity.products.reduce((sum, product) => sum + product.quantity, 0)
    const productsSku = entity.products
      .map((product) => product.sku)
      .filter((sku): sku is string => sku !== null)

    return {
      id: entity.id,
      num: entity.num ?? '',
      company_name: entity.recipientCompanyName ?? '',
      creation_time: entity.creationTime?.toISOString() ?? new Date().toISOString(),
      tracking_number_mbe: entity.trackingNumberMbe ?? null,
      state: (entity.state as MbeOrderState) ?? null,
      state_description: entity.stateDescription ?? '',
      total_products: totalProducts,
      products_sku: productsSku,
    }
  }

  /** Entity → GetMbeOrderDetail view model */
  static mapEntityToDetailViewModel(entity: MbeOrdersEntity): GetMbeOrderDetailViewModel {
    const totalProducts = entity.products.reduce((sum, product) => sum + product.quantity, 0)

    return {
      id: entity.id,
      num: entity.num ?? '',
      deposit: entity.deposit,
      department_id: entity.departmentId,
      date: entity.date?.toISOString() ?? null,
      reason: entity.reason,
      transport: entity.transport,
      port_shipment: entity.portShipment,
      note: entity.note,
      operator: entity.operator,
      shipping_packages: entity.shippingPackages,
      tracking_number: entity.trackingNumber,
      tracking_number_mbe: entity.trackingNumberMbe,
      state: (entity.state as MbeOrderState) ?? null,
      state_description: entity.stateDescription ?? '',
      working_state: entity.workingState,
      working_state_description: entity.workingStateDescription,
      creation_time: entity.creationTime?.toISOString() ?? new Date().toISOString(),
      company_name: entity.recipientCompanyName,
      total_products: totalProducts,
      products: entity.products.map((product) => ({
        product_id: product.productId,
        sku: product.sku,
        description: product.description,
        quantity: product.quantity,
        shopify_product_id: null,
        shopify_image_url: null,
      })),
    }
  }

  /** Entities → GetAllMbeOrders result with unique SKU list */
  static mapEntitiesToGetAllResult(
    entities: MbeOrdersEntity[],
    savedCount: number,
    lastSyncDate: Date,
    syncError?: string
  ): GetAllMbeOrdersResult {
    // Map entities to view models
    const orders = entities.map((entity) => this.mapEntityToViewModel(entity))

    // Extract unique SKUs from all orders
    const allSkus = orders.flatMap((order) => order.products_sku)
    const product_sku_unique_list = Array.from(new Set(allSkus)).sort()

    return {
      orders,
      savedCount,
      lastSyncDate,
      syncError,
      product_sku_unique_list,
    }
  }
}
