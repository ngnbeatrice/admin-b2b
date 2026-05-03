export interface ApplicationPropertiesEntity {
  id: string
  key: string
  value: string
  valueType: 'datetime' | 'string' | 'number'
  createdAt: Date
}
