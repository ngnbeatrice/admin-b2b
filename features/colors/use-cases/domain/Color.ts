/** Domain object — business logic lives here */
export class Color {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly imagePath: string | null,
    readonly createdAt: Date
  ) {}
}
