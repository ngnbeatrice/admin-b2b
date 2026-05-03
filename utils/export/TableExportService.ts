import { ExportFactory } from './ExportFactory'
import { TableExportBuilder } from './TableExportBuilder'
import type { ExportColumn, ExportFactoryConfig } from './types'

/**
 * High-level service for exporting table data.
 * Combines the factory and builder patterns for maximum convenience.
 *
 * This is the recommended entry point for most export use cases.
 *
 * @example
 * ```typescript
 * // Simple export with inline columns
 * TableExportService.quickExport({
 *   title: 'Users Export',
 *   baseFilename: 'users',
 *   columns: [
 *     { header: 'Name', accessor: (u) => u.name },
 *     { header: 'Email', accessor: (u) => u.email },
 *   ],
 *   data: users,
 *   format: 'csv',
 * })
 *
 * // Export with builder
 * const columns = TableExportBuilder.forType<User>()
 *   .addColumn('Name', (u) => u.name)
 *   .addColumn('Email', (u) => u.email)
 *   .build()
 *
 * TableExportService.export({
 *   title: 'Users Export',
 *   baseFilename: 'users',
 *   columns,
 *   data: users,
 *   format: 'html',
 * })
 * ```
 */
export class TableExportService {
  /**
   * Exports data with the given configuration.
   * Provides full control over the export process.
   */
  static export<T>(config: {
    title: string
    baseFilename: string
    columns: ExportColumn<T>[]
    data: T[]
    format: 'csv' | 'html'
    metadata?: Record<string, string | number>
    factoryConfig?: Partial<ExportFactoryConfig>
  }): void {
    const factory = ExportFactory.create({
      baseFilename: config.baseFilename,
      title: config.title,
      metadata: config.metadata,
      ...config.factoryConfig,
    })

    if (config.format === 'csv') {
      factory.exportToCsv(config.columns, config.data)
    } else {
      factory.exportToHtml(config.columns, config.data)
    }
  }

  /**
   * Quick export with minimal configuration.
   * Uses sensible defaults for most settings.
   */
  static quickExport<T>(config: {
    title: string
    baseFilename: string
    columns: ExportColumn<T>[]
    data: T[]
    format: 'csv' | 'html'
  }): void {
    this.export(config)
  }

  /**
   * Creates a reusable exporter for a specific data type.
   * Useful when you need to export the same type of data multiple times.
   *
   * @example
   * ```typescript
   * const productExporter = TableExportService.createExporter<Product>({
   *   title: 'Products Export',
   *   baseFilename: 'products',
   *   columns: productColumns,
   * })
   *
   * // Later, export different filtered datasets
   * productExporter.toCsv(activeProducts)
   * productExporter.toHtml(archivedProducts)
   * ```
   */
  static createExporter<T>(config: {
    title: string
    baseFilename: string
    columns: ExportColumn<T>[]
    metadata?: Record<string, string | number>
    factoryConfig?: Partial<ExportFactoryConfig>
  }) {
    const factory = ExportFactory.create({
      baseFilename: config.baseFilename,
      title: config.title,
      metadata: config.metadata,
      ...config.factoryConfig,
    })

    return {
      toCsv: (data: T[]) => factory.exportToCsv(config.columns, data),
      toHtml: (data: T[]) => factory.exportToHtml(config.columns, data),
      columns: config.columns,
    }
  }

  /**
   * Creates a builder for defining columns.
   * Provides a fluent API for column configuration.
   */
  static buildColumns<T>(): TableExportBuilder<T> {
    return TableExportBuilder.forType<T>()
  }
}
