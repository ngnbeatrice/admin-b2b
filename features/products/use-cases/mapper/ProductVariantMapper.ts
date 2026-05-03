import type { MbeWarehouseItemDTO } from '../../client/dto/MbeWarehouseDataDTO'
import type { MbeProductVariant } from '../../service/types/MbeProductVariant'

export class ProductVariantMapper {
  static toMbeProductVariant(item: MbeWarehouseItemDTO): MbeProductVariant {
    return {
      id: item.id,
      sku: item.sku,
      ean: item.ean,
      description: item.description,
      stock: item.stock,
      customer_order: item.customer_order,
      disponibility: item.stock - item.customer_order,
    }
  }
}
