export interface CollectionColor {
  id: string
  name: string
  imagePath: string | null
}

/** Domain object — business logic lives here */
export class Collection {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly createdAt: Date,
    readonly colors: CollectionColor[]
  ) {}

  get colorCount(): number {
    return this.colors.length
  }
}
