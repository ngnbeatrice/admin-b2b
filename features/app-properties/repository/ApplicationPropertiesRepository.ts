import { prisma } from '@/lib/prisma'

import type { ApplicationPropertiesEntity } from './entity/ApplicationPropertiesEntity'

export class ApplicationPropertiesRepository {
  /**
   * Retrieves the full entity by key.
   */
  async findByKey(key: string): Promise<ApplicationPropertiesEntity | null> {
    const result = await prisma.applicationProperties.findUnique({
      where: { key },
    })

    if (!result) {
      return null
    }

    return {
      id: result.id,
      key: result.key,
      value: result.value,
      valueType: result.valueType as 'datetime' | 'string' | 'number',
      createdAt: result.createdAt,
    }
  }

  /**
   * Updates an existing application property value.
   * Returns null if the key doesn't exist.
   */
  async update(key: string, value: string): Promise<ApplicationPropertiesEntity | null> {
    try {
      const result = await prisma.applicationProperties.update({
        where: { key },
        data: { value },
      })

      return {
        id: result.id,
        key: result.key,
        value: result.value,
        valueType: result.valueType as 'datetime' | 'string' | 'number',
        createdAt: result.createdAt,
      }
    } catch {
      // Record not found
      return null
    }
  }
}
