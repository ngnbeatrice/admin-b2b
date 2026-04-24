import type { ColorRepository } from '../repository'

import { ColorMapper } from './mapper/ColorMapper'
import type { GetAllColorsViewModel } from './user-view/GetAllColorsViewModel'

export class GetAllColorsUseCase {
  constructor(private readonly colorRepository: ColorRepository) {}

  async execute(locale?: string): Promise<GetAllColorsViewModel[]> {
    const entities = await this.colorRepository.findAll()
    const domain = entities.map(ColorMapper.toDomain)
    return domain.map((c) => ColorMapper.toGetAllViewModel(c, locale))
  }
}
