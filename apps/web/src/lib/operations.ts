import { mergePdfs } from '@pdf-toolkit/pdf-core'
import { getInstrumentation } from '@pdf-toolkit/operations'

/**
 * Merge PDFs with full instrumentation
 * Wraps pdf-core operation with logging, cost estimation, and analytics
 */
export async function mergePdfsWithInstrumentation(
  files: File[],
  options?: { measure?: boolean }
) {
  const instr = getInstrumentation()
  const start = performance.now()

  try {
    // Call pure pdf-core operation
    const result = await mergePdfs(files, { measure: true })
    const durationMs = result.durationMs || performance.now() - start

    // Calculate total file size
    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)

    // Record operation with instrumentation
    const record = await instr.recordOperation(
      'merge',
      {
        durationMs,
        fileSizeBytes: totalFileSize,
        pageCount: result.pageCount,
      },
      'client', // processing route
      true // success
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

    // Record failed operation
    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)
    await instr.recordOperation(
      'merge',
      {
        durationMs,
        fileSizeBytes: totalFileSize,
        pageCount: 0,
      },
      'client',
      false, // failed
      errorMessage
    )

    throw error
  }
}
