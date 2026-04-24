import { getStorageUrl } from '@/lib/storage'

import type { ColorEntity } from '../../repository'
import { Color } from '../domain/Color'
import type { GetAllColorsViewModel } from '../user-view/GetAllColorsViewModel'

export class ColorMapper {
  static toDomain(entity: ColorEntity): Color {
    return new Color(entity.id, entity.name, entity.description, entity.imagePath, entity.createdAt)
  }

  static toGetAllViewModel(domain: Color, locale = 'en'): GetAllColorsViewModel {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      imageUrl: getStorageUrl(domain.imagePath),
      createdAt: domain.createdAt.toLocaleDateString(locale, { dateStyle: 'medium' }),
    }
  }
}
