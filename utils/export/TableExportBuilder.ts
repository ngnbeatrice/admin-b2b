import type { ExportColumn } from './types'

/**
 * Fluent builder for creating export column definitions.
 * Provides a chainable API for defining table columns with type safety.
 *
 * @example
 * ```typescript
 * const columns = TableExportBuilder.forType<Product>()
 *   .addColumn('Product Name', (p) => p.title)
 *   .addColumn('Price', (p) => p.price, { className: 'text-right', width: '120px' })
 *   .addColumn('Tags', (p) => p.tags.join(', '))
 *   .build()
 * ```
 */
export class TableExportBuilder<T> {
  private columns: ExportColumn<T>[] = []

  private constructor() {}

  /**
   * Creates a new builder for the given type.
   */
  static forType<T>(): TableExportBuilder<T> {
    return new TableExportBuilder<T>()
  }

  /**
   * Adds a column to the export.
   * @param header - Column header label
   * @param accessor - Function to extract the cell value
   * @param options - Optional column configuration
   */
  addColumn(
    header: string,
    accessor: (row: T) => string | number,
    options?: { className?: string; width?: string }
  ): this {
    this.columns.push({
      header,
      accessor,
      className: options?.className,
      width: options?.width,
    })
    return this
  }

  /**
   * Adds multiple columns at once from a configuration object.
   * Useful for defining all columns in a single call.
   *
   * @example
   * ```typescript
   * builder.addColumns({
   *   'Name': (p) => p.name,
   *   'Email': (p) => p.email,
   *   'Age': (p) => p.age,
   * })
   * ```
   */
  addColumns(config: Record<string, (row: T) => string | number>): this {
    Object.entries(config).forEach(([header, accessor]) => {
      this.addColumn(header, accessor)
    })
    return this
  }

  /**
   * Adds a column with a custom formatter.
   * Useful for dates, numbers, arrays, etc.
   *
   * @example
   * ```typescript
   * builder.addFormattedColumn('Created', (p) => p.createdAt, (date) => date.toLocaleDateString())
   * ```
   */
  addFormattedColumn<V>(
    header: string,
    accessor: (row: T) => V,
    formatter: (value: V) => string | number,
    options?: { className?: string; width?: string }
  ): this {
    this.columns.push({
      header,
      accessor: (row) => formatter(accessor(row)),
      className: options?.className,
      width: options?.width,
    })
    return this
  }

  /**
   * Adds a column that joins an array with a separator.
   *
   * @example
   * ```typescript
   * builder.addArrayColumn('Tags', (p) => p.tags, ', ')
   * ```
   */
  addArrayColumn(
    header: string,
    accessor: (row: T) => string[],
    separator: string = ', ',
    options?: { className?: string; width?: string }
  ): this {
    this.columns.push({
      header,
      accessor: (row) => accessor(row).join(separator),
      className: options?.className,
      width: options?.width,
    })
    return this
  }

  /**
   * Adds a column with conditional formatting.
   *
   * @example
   * ```typescript
   * builder.addConditionalColumn(
   *   'Status',
   *   (p) => p.stock > 0 ? 'In Stock' : 'Out of Stock'
   * )
   * ```
   */
  addConditionalColumn(
    header: string,
    accessor: (row: T) => string | number,
    options?: { className?: string; width?: string }
  ): this {
    return this.addColumn(header, accessor, options)
  }

  /**
   * Returns the built column definitions.
   */
  build(): ExportColumn<T>[] {
    return this.columns
  }

  /**
   * Returns the number of columns defined.
   */
  get columnCount(): number {
    return this.columns.length
  }
}
