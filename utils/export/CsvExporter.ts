import type { CsvExportConfig, ExportColumn, ExportResult } from './types'

/**
 * Utility class for exporting data to CSV format.
 * Handles proper escaping, delimiter configuration, and BOM for Excel compatibility.
 */
export class CsvExporter {
  private readonly delimiter: string
  private readonly includeBom: boolean

  constructor(config: CsvExportConfig = {}) {
    this.delimiter = config.delimiter ?? ';'
    this.includeBom = config.includeBom ?? true
  }

  /**
   * Exports data to CSV format.
   * @param columns - Column definitions
   * @param rows - Data rows
   * @param filename - Optional filename (defaults to 'export-YYYY-MM-DD_HH-MM-SS.csv')
   * @returns ExportResult with blob and metadata
   */
  export<T>(columns: ExportColumn<T>[], rows: T[], filename?: string): ExportResult {
    const headers = columns.map((col) => this.escapeCell(col.header))
    const dataRows = rows.map((row) =>
      columns.map((col) => this.escapeCell(String(col.accessor(row))))
    )

    const csvLines = [headers.join(this.delimiter)]
    dataRows.forEach((row) => {
      csvLines.push(row.join(this.delimiter))
    })

    let csvContent = csvLines.join('\n')

    // Add BOM for Excel compatibility
    if (this.includeBom) {
      csvContent = '\uFEFF' + csvContent
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

    return {
      blob,
      filename: filename ?? this.generateDefaultFilename('csv'),
      mimeType: 'text/csv;charset=utf-8;',
    }
  }

  /**
   * Generates a default filename with date and time.
   * Format: export-YYYY-MM-DD_HH-MM-SS.extension
   */
  private generateDefaultFilename(extension: string): string {
    const now = new Date()
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    return `export-${date}_${time}.${extension}`
  }

  /**
   * Escapes a cell value for CSV format.
   * Wraps in quotes if it contains delimiter, quotes, or newlines.
   */
  private escapeCell(value: string): string {
    if (
      value.includes(this.delimiter) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
}
