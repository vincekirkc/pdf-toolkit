/**
 * Core types for instrumentation and cost estimation
 */

export type OperationType = 'merge' | 'split' | 'rotate' | 'compress' | 'convert' | 'ocr'

export interface OperationRecord {
  operationType: OperationType
  fileSizeBytes: number
  pageCount: number
  durationMs: number
  processingRoute: 'client' | 'server'
  costUsd: number
  success: boolean
  errorMessage?: string
  timestamp: Date
}

export interface ProcessingRouteRecord {
  operationType: OperationType
  fileSizeBytes: number
  pageCount: number
  processingRoute: 'client' | 'server'
  routeReason: string // 'typical', 'file_too_large', 'timeout', etc.
  durationMs: number
  costUsd: number
  timestamp: Date
}

export interface CostEstimate {
  baseOperationCost: number
  computeCost: number
  totalCost: number
}
