/**
 * Validation utilities for PDF operations
 */

const MAX_CLIENT_FILE_SIZE = 50_000_000 // 50 MB
const MAX_CLIENT_PAGES = 500

export function validateFileSize(file: File | Uint8Array): boolean {
  const size = file instanceof File ? file.size : file.length
  return size <= MAX_CLIENT_FILE_SIZE
}

export function validateFileType(file: File): boolean {
  return file.type === 'application/pdf' || file.name.endsWith('.pdf')
}

export function getMaxClientFileSize(): number {
  return MAX_CLIENT_FILE_SIZE
}

export function getMaxClientPages(): number {
  return MAX_CLIENT_PAGES
}
