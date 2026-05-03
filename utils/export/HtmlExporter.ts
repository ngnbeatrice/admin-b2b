import type { ExportColumn, ExportResult, HtmlExportConfig } from './types'

/**
 * Utility class for exporting data to styled HTML format.
 * Generates a complete HTML document with embedded CSS and optional metadata.
 */
export class HtmlExporter {
  private readonly config: Required<Omit<HtmlExportConfig, 'metadata' | 'customCellRenderer'>> & {
    metadata?: Record<string, string | number>
    customCellRenderer?: <T>(row: T, columnIndex: number) => string | null
  }

  constructor(config: HtmlExportConfig) {
    this.config = {
      title: config.title,
      primaryColor: config.primaryColor ?? 'var(--color-brand-2)',
      backgroundColor: config.backgroundColor ?? 'var(--color-brand-5)',
      textColor: config.textColor ?? 'var(--color-brand-1)',
      metadata: config.metadata,
      customCellRenderer: config.customCellRenderer,
    }
  }

  /**
   * Exports data to HTML format.
   * @param columns - Column definitions
   * @param rows - Data rows
   * @param filename - Optional filename (defaults to 'export-YYYY-MM-DD_HH-MM-SS.html')
   * @returns ExportResult with blob and metadata
   */
  export<T>(columns: ExportColumn<T>[], rows: T[], filename?: string): ExportResult {
    const htmlContent = this.generateHtml(columns, rows)
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })

    return {
      blob,
      filename: filename ?? this.generateDefaultFilename('html'),
      mimeType: 'text/html;charset=utf-8;',
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

  private generateHtml<T>(columns: ExportColumn<T>[], rows: T[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(this.config.title)} - ${new Date().toLocaleDateString()}</title>
  <style>
    ${this.generateStyles()}
  </style>
</head>
<body>
  <h1>${this.escapeHtml(this.config.title)}</h1>
  ${this.generateMetadata()}
  <table>
    <thead>
      <tr>
        ${columns.map((col) => this.generateHeaderCell(col)).join('\n        ')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row, rowIndex) => this.generateRow(row, rowIndex, columns)).join('\n      ')}
    </tbody>
  </table>
</body>
</html>`
  }

  private generateStyles(): string {
    return `:root {
      /* Brand Colors */
      --color-brand-1: #2c2420;
      --color-brand-2: #7c6a5e;
      --color-brand-3: #a89080;
      --color-brand-4: #c4b0a4;
      --color-brand-5: #faf7f5;
      --color-border: #e8ddd8;
      --color-muted-foreground: #9c8880;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 40px;
      background-color: ${this.config.backgroundColor};
      color: ${this.config.textColor};
    }
    h1 {
      color: ${this.config.primaryColor};
      margin-bottom: 10px;
    }
    .meta {
      color: var(--color-muted-foreground);
      margin-bottom: 30px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background-color: ${this.config.primaryColor};
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid var(--color-border);
      font-size: 14px;
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover {
      background-color: ${this.config.backgroundColor};
    }
    .text-right {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }
    .text-center {
      text-align: center;
    }
    .product-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--color-border);
    }
    .no-image {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: #f9fafb;
      display: inline-block;
    }`
  }

  private generateMetadata(): string {
    if (!this.config.metadata) return ''

    const metaLines = Object.entries(this.config.metadata)
      .map(([key, value]) => `<strong>${this.escapeHtml(key)}:</strong> ${this.escapeHtml(String(value))}`)
      .join('<br>\n    ')

    return `  <div class="meta">
    ${metaLines}
  </div>\n`
  }

  private generateHeaderCell<T>(column: ExportColumn<T>): string {
    const style = column.width ? ` style="width: ${column.width};"` : ''
    const className = column.className ? ` class="${column.className}"` : ''
    return `<th${style}${className}>${this.escapeHtml(column.header)}</th>`
  }

  private generateRow<T>(row: T, rowIndex: number, columns: ExportColumn<T>[]): string {
    const cells = columns
      .map((col, colIndex) => {
        // Check if custom renderer exists and returns content
        const customContent = this.config.customCellRenderer?.(row, colIndex)
        if (customContent !== null && customContent !== undefined) {
          return `<td${col.className ? ` class="${col.className}"` : ''}>${customContent}</td>`
        }

        // Default rendering
        const value = col.accessor(row)
        return `<td${col.className ? ` class="${col.className}"` : ''}>${this.escapeHtml(String(value))}</td>`
      })
      .join('\n        ')

    return `<tr>
        ${cells}
      </tr>`
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => map[char] ?? char)
  }
}
