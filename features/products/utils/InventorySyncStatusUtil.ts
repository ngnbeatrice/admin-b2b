/**
 * Utility class for determining inventory synchronization status between Shopify and MBE.
 * Returns appropriate CSS classes based on the comparison of quantities.
 */
export class InventorySyncStatusUtil {
  /**
   * Sync status types based on Shopify and MBE quantity comparison.
   */
  private static readonly SyncStatus = {
    CRITICAL_MISMATCH: 'critical-mismatch', // Shopify > 0 and MBE < 0
    BACKORDER: 'backorder', // MBE < 0
    MISSING_MBE_DATA: 'missing-mbe-data', // Shopify > 0 and MBE is null
    MBE_HIGHER: 'mbe-higher', // MBE > Shopify
    MBE_LOWER: 'mbe-lower', // MBE < Shopify
    SYNCHRONIZED: 'synchronized', // Values match or both null/zero
  } as const

  /**
   * Determines the sync status between Shopify and MBE quantities.
   *
   * @param shopifyQty - Shopify inventory quantity (on hand)
   * @param mbeQty - MBE disponibility
   * @returns Sync status type
   */
  private static getSyncStatus(shopifyQty: number | null, mbeQty: number | null): string {
    // If Shopify is positive and MBE is negative → Critical mismatch
    if (shopifyQty !== null && shopifyQty > 0 && mbeQty !== null && mbeQty < 0) {
      return this.SyncStatus.CRITICAL_MISMATCH
    }

    // If MBE is negative (and Shopify is not positive) → Backorder/reserved
    if (mbeQty !== null && mbeQty < 0) {
      return this.SyncStatus.BACKORDER
    }

    // If Shopify has inventory but MBE is null → Missing MBE data
    if (shopifyQty !== null && shopifyQty > 0 && mbeQty === null) {
      return this.SyncStatus.MISSING_MBE_DATA
    }

    // If both values exist and differ
    if (shopifyQty !== null && mbeQty !== null && shopifyQty !== mbeQty) {
      if (mbeQty > shopifyQty) {
        return this.SyncStatus.MBE_HIGHER
      } else {
        return this.SyncStatus.MBE_LOWER
      }
    }

    // Default: synchronized
    return this.SyncStatus.SYNCHRONIZED
  }

  /**
   * Determines the badge/row color class based on Shopify and MBE quantities.
   *
   * @param shopifyQty - Shopify inventory quantity (on hand)
   * @param mbeQty - MBE disponibility
   * @returns CSS class string for styling
   */
  static getStatusClassName(shopifyQty: number | null, mbeQty: number | null): string {
    const status = this.getSyncStatus(shopifyQty, mbeQty)

    switch (status) {
      case this.SyncStatus.CRITICAL_MISMATCH:
      case this.SyncStatus.MISSING_MBE_DATA:
      case this.SyncStatus.MBE_LOWER:
        return 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]'

      case this.SyncStatus.BACKORDER:
        return 'border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)]'

      case this.SyncStatus.MBE_HIGHER:
        return 'border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)]'

      case this.SyncStatus.SYNCHRONIZED:
      default:
        return ''
    }
  }

  /**
   * Gets the background color class for table rows.
   * Similar to badge colors but optimized for row backgrounds.
   *
   * @param shopifyQty - Shopify inventory quantity (on hand)
   * @param mbeQty - MBE disponibility
   * @returns CSS class string for row background
   */
  static getRowBackgroundClassName(shopifyQty: number | null, mbeQty: number | null): string {
    const status = this.getSyncStatus(shopifyQty, mbeQty)

    switch (status) {
      case this.SyncStatus.CRITICAL_MISMATCH:
      case this.SyncStatus.MISSING_MBE_DATA:
      case this.SyncStatus.MBE_LOWER:
        return 'bg-[var(--color-error)]/20'

      case this.SyncStatus.BACKORDER:
        return 'bg-[var(--color-info)]/20'

      case this.SyncStatus.MBE_HIGHER:
        return 'bg-[var(--color-warning)]/20'

      case this.SyncStatus.SYNCHRONIZED:
      default:
        return ''
    }
  }
}
