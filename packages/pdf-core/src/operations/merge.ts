/**
 * Merge multiple PDF files into a single PDF
 *
 * Pure operation: no side effects, no logging, no external dependencies beyond pdf-lib.
 */

import { PDFDocument } from 'pdfjs-dist'
import type { OperationResult, MergeOptions } from '../types'

/**
 * Merge multiple PDF files into a single PDF document.
 *
 * @param files - Array of PDF files (File objects or Uint8Array buffers)
 * @param options - Optional configuration (measure, etc.)
 * @returns OperationResult with merged PDF bytes, page count, and optional duration
 *
 * @example
 * const files = [pdfFile1, pdfFile2]
 * const result = await mergePdfs(files, { measure: true })
 * console.log(`Merged in ${result.durationMs}ms`)
 */
export async function mergePdfs(
  files: (File | Uint8Array)[],
  options?: MergeOptions
): Promise<OperationResult> {
  const start = performance.now()

  if (!files || files.length === 0) {
    throw new Error('At least one PDF file is required')
  }

  if (files.length === 1) {
    throw new Error('At least two PDF files are required to merge')
  }

  // Convert all files to Uint8Array
  const buffers = await Promise.all(
    files.map(file => fileToUint8Array(file))
  )

  // Create a new PDF document to hold the merged result
  const mergedPdf = await PDFDocument.create()

  // Copy pages from each source PDF into the merged document
  for (const buffer of buffers) {
    const sourcePdf = await PDFDocument.load(buffer)
    const pageIndices = sourcePdf.getPageIndices()
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices)
    copiedPages.forEach(page => mergedPdf.addPage(page))
  }

  // Get the merged PDF as bytes
  const pdfBytes = await mergedPdf.save()
  const pageCount = mergedPdf.getPageCount()

  const durationMs = options?.measure ? performance.now() - start : undefined

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    pageCount,
    durationMs,
  }
}

/**
 * Convert a File or Uint8Array to Uint8Array
 */
async function fileToUint8Array(file: File | Uint8Array): Promise<Uint8Array> {
  if (file instanceof Uint8Array) {
    return file
  }

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }

  throw new Error('Input must be a File or Uint8Array')
}
