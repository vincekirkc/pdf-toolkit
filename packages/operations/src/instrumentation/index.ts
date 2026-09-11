/**
 * Instrumentation module for logging and tracking PDF operations
 *
 * This layer sits between the application and pdf-core.
 * It handles:
 * - Recording operation metrics (duration, file size, page count)
 * - Cost estimation
 * - Processing route decisions (client vs server)
 * - Logging to external systems (database, analytics, etc.)
 */

import type { OperationRecord, OperationType, CostEstimate } from './types'
import { estimateCost } from './cost-estimator'

/**
 * Instrumentable operation result
 */
export interface InstrumentableResult {
  durationMs: number
  fileSizeBytes: number
  pageCount: number
}

/**
 * Callback interface for logging operations
 * Applications should implement this to persist data to their database
 */
export interface OperationLogger {
  log(record: OperationRecord): Promise<void>
}

/**
 * Default no-op logger (console only)
 */
class ConsoleLogger implements OperationLogger {
  async log(record: OperationRecord): Promise<void> {
    console.log('[OperationCost]', {
      operation: record.operationType,
      duration: `${record.durationMs}ms`,
      pages: record.pageCount,
      size: `${(record.fileSizeBytes / 1024 / 1024).toFixed(2)}MB`,
      cost: `$${record.costUsd.toFixed(6)}`,
      route: record.processingRoute,
    })
  }
}

/**
 * Instrumentation context
 * Maintains the logger and provides methods for recording operations
 */
export class Instrumentation {
  private logger: OperationLogger

  constructor(logger?: OperationLogger) {
    this.logger = logger || new ConsoleLogger()
  }

  /**
   * Record an operation with full instrumentation
   */
  async recordOperation(
    operationType: OperationType,
    result: InstrumentableResult,
    processingRoute: 'client' | 'server' = 'client',
    success: boolean = true,
    errorMessage?: string
  ): Promise<OperationRecord> {
    const costEstimate = estimateCost(operationType, result.fileSizeBytes, result.durationMs)

    const record: OperationRecord = {
      operationType,
      fileSizeBytes: result.fileSizeBytes,
      pageCount: result.pageCount,
      durationMs: result.durationMs,
      processingRoute,
      costUsd: costEstimate.totalCost,
      success,
      errorMessage,
      timestamp: new Date(),
    }

    await this.logger.log(record)
    return record
  }

  /**
   * Set a custom logger
   */
  setLogger(logger: OperationLogger): void {
    this.logger = logger
  }
}

/**
 * Global instrumentation instance
 */
export const globalInstrumentation = new Instrumentation()

/**
 * Helper to get the global instrumentation instance
 */
export function getInstrumentation(): Instrumentation {
  return globalInstrumentation
}
