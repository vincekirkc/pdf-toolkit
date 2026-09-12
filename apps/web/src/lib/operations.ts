import { mergePdfs, splitPdf, splitPdfIntoChunks, rotatePdf, compressPdf } from '@pdf-toolkit/pdf-core'
import { getInstrumentation } from '@pdf-toolkit/operations'

/**
 * Merge PDFs with full instrumentation
 */
export async function mergePdfsWithInstrumentation(
  files: File[],
  options?: { measure?: boolean }
) {
  const instr = getInstrumentation()
  const start = performance.now()

  try {
    const result = await mergePdfs(files, { measure: true })
    const durationMs = result.durationMs || performance.now() - start
    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)

    const record = await instr.recordOperation(
      'merge',
      {
        durationMs,
        fileSizeBytes: totalFileSize,
        pageCount: result.pageCount,
      },
      'client',
      true
    )

    return {
      pdfBytes: result.pdfBytes,
      pageCount: result.pageCount,
      durationMs,
      costUsd: record.costUsd,
      success: true,
    }
  } catch (error) {
    const durationMs = performance.now() - start
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)

    await instr.recordOperation(
      'merge',
      {
        durationMs,
        fileSizeBytes: totalFileSize,
        pageCount: 0,
      },
      'client',
      false,
      errorMessage
    )

    throw error
  }
}

/**
 * Split PDF with full instrumentation
 */
export async function splitPdfWithInstrumentation(
  file: File,
  pagesPerChunk?: number
) {
  const instr = getInstrumentation()
  const start = performance.now()

  try {
    const results = pagesPerChunk
      ? await splitPdfIntoChunks(file, pagesPerChunk, { measure: true })
      : await splitPdf(file, { measure: true })

    const durationMs = performance.now() - start
    const totalPages = results.reduce((sum, r) => sum + r.pageCount, 0)

    const record = await instr.recordOperation(
      'split',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: totalPages,
      },
      'client',
      true
    )

    return {
      results,
      durationMs,
      costUsd: record.costUsd,
      success: true,
    }
  } catch (error) {
    const durationMs = performance.now() - start
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await instr.recordOperation(
      'split',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: 0,
      },
      'client',
      false,
      errorMessage
    )

    throw error
  }
}

/**
 * Rotate PDF with full instrumentation
 */
export async function rotatePdfWithInstrumentation(
  file: File,
  degrees: number = 90,
  pages?: number[]
) {
  const instr = getInstrumentation()
  const start = performance.now()

  try {
    const result = await rotatePdf(file, { degrees, pages, measure: true })
    const durationMs = result.durationMs || performance.now() - start

    const record = await instr.recordOperation(
      'rotate',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: result.pageCount,
      },
      'client',
      true
    )

    return {
      pdfBytes: result.pdfBytes,
      pageCount: result.pageCount,
      durationMs,
      costUsd: record.costUsd,
      success: true,
    }
  } catch (error) {
    const durationMs = performance.now() - start
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await instr.recordOperation(
      'rotate',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: 0,
      },
      'client',
      false,
      errorMessage
    )

    throw error
  }
}

/**
 * Compress PDF with full instrumentation
 */
export async function compressPdfWithInstrumentation(
  file: File,
  quality: 'low' | 'medium' | 'high' = 'medium'
) {
  const instr = getInstrumentation()
  const start = performance.now()

  try {
    const result = await compressPdf(file, { quality, measure: true })
    const durationMs = result.durationMs || performance.now() - start

    const record = await instr.recordOperation(
      'compress',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: result.pageCount,
      },
      'client',
      true
    )

    return {
      pdfBytes: result.pdfBytes,
      pageCount: result.pageCount,
      durationMs,
      costUsd: record.costUsd,
      success: true,
    }
  } catch (error) {
    const durationMs = performance.now() - start
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await instr.recordOperation(
      'compress',
      {
        durationMs,
        fileSizeBytes: file.size,
        pageCount: 0,
      },
      'client',
      false,
      errorMessage
    )

    throw error
  }
}
