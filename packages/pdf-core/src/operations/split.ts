/**
 * Split a PDF into separate single-page documents
 *
 * Pure operation: no side effects, returns array of separate PDFs
 */

import { PDFDocument } from 'pdfjs-dist'
import type { OperationResult } from '../types'

export interface SplitOptions {
  measure?: boolean
}

/**
 * Split a PDF into separate single-page documents.
 *
 * @param file - PDF file (File object or Uint8Array)
 * @param options - Optional configuration
 * @returns Array of OperationResult objects, one per page
 *
 * @example
 * const file = pdfFile
 * const pages = await splitPdf(file)
 * console.log(`Split into ${pages.length} pages`)
 */
export async function splitPdf(
  file: File | Uint8Array,
  options?: SplitOptions
): Promise<OperationResult[]> {
  const start = performance.now()

  if (!file) {
    throw new Error('A PDF file is required')
  }

  // Convert to Uint8Array if needed
  const buffer = file instanceof Uint8Array ? file : await file.arrayBuffer().then(ab => new Uint8Array(ab))

  // Load the source PDF
  const sourcePdf = await PDFDocument.load(buffer)
  const pageCount = sourcePdf.getPageCount()

  if (pageCount === 0) {
    throw new Error('PDF has no pages')
  }

  // Create a separate PDF for each page
  const results: OperationResult[] = []

  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create()
    const [copiedPage] = await singlePagePdf.copyPages(sourcePdf, [i])
    singlePagePdf.addPage(copiedPage)

    const pdfBytes = await singlePagePdf.save()
    const durationMs = options?.measure ? performance.now() - start : undefined

    results.push({
      pdfBytes: new Uint8Array(pdfBytes),
      pageCount: 1,
      durationMs,
    })
  }

  return results
}

/**
 * Split a PDF into chunks of N pages
 *
 * @param file - PDF file
 * @param pagesPerChunk - Number of pages per chunk (default: 1)
 * @param options - Optional configuration
 * @returns Array of OperationResult objects
 */
export async function splitPdfIntoChunks(
  file: File | Uint8Array,
  pagesPerChunk: number = 1,
  options?: SplitOptions
): Promise<OperationResult[]> {
  const start = performance.now()

  if (!file) {
    throw new Error('A PDF file is required')
  }

  if (pagesPerChunk < 1) {
    throw new Error('pagesPerChunk must be at least 1')
  }

  // Convert to Uint8Array if needed
  const buffer = file instanceof Uint8Array ? file : await file.arrayBuffer().then(ab => new Uint8Array(ab))

  // Load the source PDF
  const sourcePdf = await PDFDocument.load(buffer)
  const pageCount = sourcePdf.getPageCount()

  if (pageCount === 0) {
    throw new Error('PDF has no pages')
  }

  // Create chunks
  const results: OperationResult[] = []
  const chunks = Math.ceil(pageCount / pagesPerChunk)

  for (let chunk = 0; chunk < chunks; chunk++) {
    const chunkPdf = await PDFDocument.create()
    const startPage = chunk * pagesPerChunk
    const endPage = Math.min(startPage + pagesPerChunk, pageCount)
    const pageIndices = Array.from({ length: endPage - startPage }, (_, i) => startPage + i)

    const copiedPages = await chunkPdf.copyPages(sourcePdf, pageIndices)
    copiedPages.forEach(page => chunkPdf.addPage(page))

    const pdfBytes = await chunkPdf.save()
    const durationMs = options?.measure ? performance.now() - start : undefined

    results.push({
      pdfBytes: new Uint8Array(pdfBytes),
      pageCount: endPage - startPage,
      durationMs,
    })
  }

  return results
}
