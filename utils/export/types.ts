import type { CsvExportConfig, ExportColumn, ExportResult } from './types'

export interface ExportFactoryConfig {
  /** Base filename (without extension). Date will be appended automatically. */
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

/** Column definition for table exports */
export interface ExportColumn<T> {
  /** Column header label */
  header: string
  /** Function to extract the cell value from a row */
  accessor: (row: T) => string | number
  /** Optional CSS class for HTML export (e.g., 'text-right') */
  className?: string
  /** Optional width for HTML export (e.g., '64px', '200px') */
  width?: string
}

/** Configuration for HTML export styling */
export interface HtmlExportConfig {
  /** Document title */
  title: string
  /** Primary brand color (hex) */
  primaryColor?: string
  /** Background color (hex) */
  backgroundColor?: string
  /** Text color (hex) */
  textColor?: string
  /** Optional metadata to display above the table */
  metadata?: Record<string, string | number>
  /** Optional function to render a custom cell (e.g., for images) */
  customCellRenderer?: <T>(row: T, columnIndex: number) => string | null
}

/** Configuration for CSV export */
export interface CsvExportConfig {
  /** Field delimiter (default: ';') */
  delimiter?: string
  /** Include BOM for Excel compatibility (default: true) */
  includeBom?: boolean
}

/** Result of an export operation */
export interface ExportResult {
  /** Blob containing the file content */
  blob: Blob
  /** Suggested filename */
  filename: string
  /** MIME type */
  mimeType: string
}
