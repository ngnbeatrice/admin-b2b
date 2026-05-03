import type { MbeOrderState } from '../domain/MbeOrderState'

export interface MbeOrder {
  id: string
  num: string | null
  deposit: string | null
  department_id: string | null
  date: string | null
  reason: string | null
  transport: string | null
  port_shipment: string | null
  note: string | null
  operator: string | null
  shipping_packages: number | null
  tracking_number: string | null
  tracking_number_mbe: string | null
  state: MbeOrderState | null
  state_description: string | null
  working_state: string | null
  working_state_description: string | null
  creation_time: string
  recipient: {
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
  destination: {
    company_name: string
    address: string
    postcode: string
    city: string
    province: string
    country: string
    email: string
    phone: string
  }
  products: {
    id: string
    sku: string | null
    description: string
    qnt: number
    lot: string
    expire_date: string
    serial: string
    id_container: string | null
    container_name: string | null
    id_container_uds: string | null
    container_name_uds: string | null
    qnt_init: number
    qnt_fulfilled: number
    state: number
    related_doc_id: string | null
    related_doc_num: string | null
    related_doc_date: string | null
  }[]
}
