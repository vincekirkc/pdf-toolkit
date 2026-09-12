/**
 * Rotate pages in a PDF
 *
 * Pure operation: rotates specified pages and returns new PDF
 */

import { PDFDocument, degrees } from 'pdfjs-dist'
import type { OperationResult } from '../types'

export interface RotateOptions {
  measure?: boolean
  degrees?: number // 90, 180, or 270
  pages?: number[] // specific pages to rotate (default: all)
}

/**
 * Rotate pages in a PDF document.
 *
 * @param file - PDF file (File object or Uint8Array)
 * @param options - Rotation options (degrees, pages to rotate)
 * @returns OperationResult with rotated PDF
 *
 * @example
 * const file = pdfFile
 * const result = await rotatePdf(file, { degrees: 90, measure: true })
 * console.log(`Rotated in ${result.durationMs}ms`)
 */
export async function rotatePdf(
  file: File | Uint8Array,
  options?: RotateOptions
): Promise<OperationResult> {
  const start = performance.now()
  const rotationDegrees = options?.degrees ?? 90

  if (!file) {
    throw new Error('A PDF file is required')
  }

  if (![90, 180, 270, -90, -180, -270].includes(rotationDegrees)) {
    throw new Error('Degrees must be 90, 180, or 270')
  }

  // Convert to Uint8Array if needed
  const buffer = file instanceof Uint8Array ? file : await file.arrayBuffer().then(ab => new Uint8Array(ab))

  // Load and process
  const pdf = await PDFDocument.load(buffer)
  const pageCount = pdf.getPageCount()

  if (pageCount === 0) {
    throw new Error('PDF has no pages')
  }

  // Determine which pages to rotate
  const pagesToRotate = options?.pages || Array.from({ length: pageCount }, (_, i) => i)

  // Rotate specified pages
  for (const pageIndex of pagesToRotate) {
    if (pageIndex >= 0 && pageIndex < pageCount) {
      const page = pdf.getPage(pageIndex)
      page.setRotation(degrees(rotationDegrees))
    }
  }

  // Save and return
  const pdfBytes = await pdf.save()
  const durationMs = options?.measure ? performance.now() - start : undefined

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    pageCount,
    durationMs,
  }
}
