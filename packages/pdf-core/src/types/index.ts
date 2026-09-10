/**
 * Core types for PDF operations
 */

export interface OperationResult {
  pdfBytes: Uint8Array
  pageCount: number
  durationMs?: number
}

export interface OperationOptions {
  measure?: boolean
}

export interface MergeOptions extends OperationOptions {}
