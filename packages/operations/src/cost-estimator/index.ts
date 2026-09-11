/**
 * Cost estimation for PDF operations
 *
 * This module estimates operational costs based on:
 * - Operation type (merge, split, OCR, etc.)
 * - File size (larger files = more compute)
 * - Duration (longer operations = more server time)
 *
 * Costs are estimates and should be calibrated against actual infrastructure costs.
 */

import type { OperationType, CostEstimate } from './types'

/**
 * Infrastructure cost assumptions (adjusted as you monitor actual usage)
 */
const COST_CONFIG = {
  // Base cost per operation (fixed)
  BASE_COST: {
    merge: 0.00001,
    split: 0.00001,
    rotate: 0.00001,
    compress: 0.00002,
    convert: 0.00005,
    ocr: 0.00100,
  },

  // Cost per second of processing (variable)
  COMPUTE_COST_PER_MS: {
    merge: 0.000001, // ~$0.001 per second
    split: 0.000001,
    rotate: 0.000001,
    compress: 0.000002,
    convert: 0.000003,
    ocr: 0.000050, // OCR is more expensive
  },

  // Cost per MB of file (storage, bandwidth)
  SIZE_COST_PER_MB: {
    merge: 0.000001,
    split: 0.000001,
    rotate: 0.000001,
    compress: 0.000001,
    convert: 0.000002,
    ocr: 0.000005,
  },
}

/**
 * Estimate the cost of an operation
 *
 * @param operationType - Type of operation (merge, split, etc.)
 * @param fileSizeBytes - Total size of input files
 * @param durationMs - How long the operation took
 * @returns Cost estimate breakdown
 */
export function estimateCost(
  operationType: OperationType,
  fileSizeBytes: number,
  durationMs: number
): CostEstimate {
  const baseCost = COST_CONFIG.BASE_COST[operationType]
  const computeCost = (durationMs / 1000) * COST_CONFIG.COMPUTE_COST_PER_MS[operationType]
  const sizeMB = fileSizeBytes / 1024 / 1024
  const sizeCost = sizeMB * COST_CONFIG.SIZE_COST_PER_MB[operationType]

  return {
    baseOperationCost: baseCost,
    computeCost: computeCost + sizeCost,
    totalCost: baseCost + computeCost + sizeCost,
  }
}

/**
 * Get cost config for calibration and testing
 */
export function getCostConfig() {
  return COST_CONFIG
}

/**
 * Update cost config (for testing or calibration)
 */
export function updateCostConfig(updates: Partial<typeof COST_CONFIG>): void {
  Object.assign(COST_CONFIG, updates)
}
