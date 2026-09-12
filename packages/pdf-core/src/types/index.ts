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

export interface SplitOptions extends OperationOptions {}

export interface RotateOptions extends OperationOptions {
  degrees?: number
  pages?: number[]
}

export interface CompressOptions extends OperationOptions {
  quality?: 'low' | 'medium' | 'high'
}
