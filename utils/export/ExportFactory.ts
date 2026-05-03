import { CsvExporter } from './CsvExporter'
import { FileDownloader } from './FileDownloader'
import { HtmlExporter } from './HtmlExporter'
import type { CsvExportConfig, ExportColumn, HtmlExportConfig } from './types'

/**
 * Configuration for the export factory.
 * Provides sensible defaults while allowing full customization.
 */
export interface ExportFactoryConfig {
  /** Base filename (without extension). Date and time will be appended automatically. */
  baseFilename: string
  /** Title for HTML export */
  title: string
  /** Optional metadata to display in HTML export */
  metadata?: Record<string, string | number>
  /** CSV configuration */
  csv?: CsvExportConfig
  /** HTML configuration (merged with defaults) */
  html?: Partial<HtmlExportConfig>
}

/**
 * Factory for creating and executing table exports.
 * Provides a unified, type-safe interface for exporting any table data to CSV or HTML.
 *
 * Generated filenames follow the format: baseFilename-YYYY-MM-DD_HH-MM-SS.extension
 *
 * @example
 * ```typescript
 * const factory = ExportFactory.create({
 *   baseFilename: 'products',
 *   title: 'Products Export',
 *   metadata: { 'Total': products.length }
 * })
 *
 * factory.exportToCsv(columns, products)
 * // Generates: products-2026-05-03_14-30-45.csv
 *
 * factory.exportToHtml(columns, products)
 * // Generates: products-2026-05-03_14-30-45.html
 * ```
 */
export class ExportFactory {
  private readonly config: ExportFactoryConfig
  private readonly csvExporter: CsvExporter
  private readonly htmlExporter: HtmlExporter

  private constructor(config: ExportFactoryConfig) {
    this.config = config
    this.csvExporter = new CsvExporter(config.csv)
    this.htmlExporter = new HtmlExporter({
      title: config.title,
      primaryColor: config.html?.primaryColor ?? 'var(--color-brand-2)',
      backgroundColor: config.html?.backgroundColor ?? 'var(--color-brand-5)',
      textColor: config.html?.textColor ?? 'var(--color-brand-1)',
      metadata: config.metadata,
      customCellRenderer: config.html?.customCellRenderer,
    })
  }

  /**
   * Creates a new export factory with the given configuration.
   */
  static create(config: ExportFactoryConfig): ExportFactory {
    return new ExportFactory(config)
  }

  /**
   * Exports data to CSV and triggers download.
   * @param columns - Column definitions
   * @param rows - Data rows
   */
  exportToCsv<T>(columns: ExportColumn<T>[], rows: T[]): void {
    const filename = this.generateFilename('csv')
    const result = this.csvExporter.export(columns, rows, filename)
    FileDownloader.download(result)
  }

  /**
   * Exports data to HTML and triggers download.
   * @param columns - Column definitions
   * @param rows - Data rows
   */
  exportToHtml<T>(columns: ExportColumn<T>[], rows: T[]): void {
    const filename = this.generateFilename('html')
    const result = this.htmlExporter.export(columns, rows, filename)
    FileDownloader.download(result)
  }

  /**
   * Generates a filename with the current date and time.
   * Format: baseFilename-YYYY-MM-DD_HH-MM-SS.extension
   */
  private generateFilename(extension: string): string {
    const now = new Date()
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    return `${this.config.baseFilename}-${date}_${time}.${extension}`
  }
}
