import type { MbeOrdersProductsEntity } from './MbeOrdersProductsEntity'

/** Raw shape returned by MbeOrdersRepository — mirrors the DB row */
export interface MbeOrdersEntity {
  mbeOrdersId: number
  id: string
  num: string | null
  deposit: string | null
  departmentId: string | null
  date: Date | null
  reason: string | null
  transport: string | null
  portShipment: string | null
  note: string | null
  operator: string | null
  shippingPackages: number | null
  trackingNumber: string | null
  trackingNumberMbe: string | null
  state: number | null
  stateDescription: string | null
  workingState: string | null
  workingStateDescription: string | null
  creationTime: Date | null
  recipientCompanyName: string | null
  recipient: unknown
  createdAt: Date | null
  updatedAt: Date | null
  products: MbeOrdersProductsEntity[]
}
