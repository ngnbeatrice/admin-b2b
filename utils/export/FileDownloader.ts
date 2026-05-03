import type { ExportResult } from './types'

/**
 * Utility class for triggering file downloads in the browser.
 * Handles blob URL creation, cleanup, and download triggering.
 */
export class FileDownloader {
  /**
   * Triggers a download of the given export result.
   * Automatically cleans up the blob URL after download.
   */
  static download(result: ExportResult): void {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(result.blob)
    link.download = result.filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  /**
   * Triggers a download with custom filename.
   */
  static downloadAs(result: ExportResult, filename: string): void {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(result.blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }
}
