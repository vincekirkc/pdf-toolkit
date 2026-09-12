# @pdf-toolkit/pdf-core

Core PDF manipulation library for pdf-toolkit.

## Philosophy

`pdf-core` is a **pure, framework-agnostic library** for PDF operations. It has:

- ✅ Zero business logic (no user IDs, costs, analytics)
- ✅ Zero external dependencies (only pdf-lib)
- ✅ Pure functions (no side effects)
- ✅ Optional performance measurement
- ✅ Full TypeScript support

## Usage

### Merge

```typescript
import { mergePdfs } from '@pdf-toolkit/pdf-core'

const files = [pdf1, pdf2]
const result = await mergePdfs(files, { measure: true })

console.log(`Merged ${result.pageCount} pages in ${result.durationMs}ms`)
```

### Split

```typescript
import { splitPdf, splitPdfIntoChunks } from '@pdf-toolkit/pdf-core'

// Split into individual pages
const pages = await splitPdf(pdfFile, { measure: true })
console.log(`Split into ${pages.length} pages`)

// Split into chunks of 10 pages
const chunks = await splitPdfIntoChunks(pdfFile, 10)
console.log(`Split into ${chunks.length} chunks`)
```

### Rotate

```typescript
import { rotatePdf } from '@pdf-toolkit/pdf-core'

// Rotate all pages 90 degrees
const result = await rotatePdf(pdfFile, { degrees: 90, measure: true })

// Rotate specific pages
const result = await rotatePdf(pdfFile, { 
  degrees: 90, 
  pages: [0, 1, 2] // rotate first 3 pages
})
```

### Compress

```typescript
import { compressPdf } from '@pdf-toolkit/pdf-core'

const result = await compressPdf(pdfFile, { quality: 'medium', measure: true })
console.log(`Compressed in ${result.durationMs}ms`)

// Note: Client-side compression is limited to stream optimization.
// For real image compression, use server-side processing.
```

## Operations

- `mergePdfs()` - Merge multiple PDFs into one
- `splitPdf()` - Split PDF into single-page documents
- `splitPdfIntoChunks()` - Split PDF into chunks of N pages
- `rotatePdf()` - Rotate pages in a PDF
- `compressPdf()` - Basic PDF compression (stream optimization)

## Performance Targets

All operations target **< 2 seconds** for typical files:

| Operation | Typical Duration | File Size |
|-----------|------------------|----------|
| Merge 2 PDFs | ~200ms | 5-10 MB |
| Split 50-page PDF | ~150ms | 5-10 MB |
| Rotate all pages | ~100ms | 5-10 MB |
| Compress | ~250ms | 10-20 MB |

## Architecture

This library is designed to be:

1. **Testable** - Pure functions with no external dependencies
2. **Reusable** - Can be published to NPM and used by other projects
3. **Portable** - Works in browsers, Node.js, and could wrap native libraries
4. **Fast** - Minimal overhead, direct PDF operations
5. **Composable** - Operations can be chained (split → rotate → merge)

Business logic (logging, cost estimation, user quotas) lives in the application layer, not here.
