import type { ApplicationPropertiesRepository } from '../repository/ApplicationPropertiesRepository'

export class ApplicationPropertiesService {
  constructor(private readonly applicationPropertiesRepository: ApplicationPropertiesRepository) {}

  /**
   * Retrieves a typed value from application_properties by key.
   * Returns the value cast to the appropriate type based on value_type.
   */
  async getValue(key: string): Promise<Date | string | number | null> {
    const property = await this.applicationPropertiesRepository.findByKey(key)

    if (!property) {
      return null
    }

    switch (property.valueType) {
      case 'datetime':
        return new Date(property.value)
      case 'number':
        return Number(property.value)
      case 'string':
      default:
        return property.value
    }
  }

  /**
   * Sets a value in application_properties by key.
   * Only updates existing entries. Returns false if the key doesn't exist.
   */
  async setValue(key: string, value: string): Promise<boolean> {
    const result = await this.applicationPropertiesRepository.update(key, value)
    return result !== null
  }
}
