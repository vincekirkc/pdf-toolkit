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

```typescript
import { mergePdfs } from '@pdf-toolkit/pdf-core'

const files = [pdf1, pdf2]
const result = await mergePdfs(files, { measure: true })

console.log(`Merged ${result.pageCount} pages in ${result.durationMs}ms`)
```

## Operations

- `mergePdfs()` - Merge multiple PDFs into one
- `splitPdfs()` - Split a PDF into separate documents
- `rotatePdf()` - Rotate pages in a PDF
- `compressPdf()` - Compress a PDF (reduce file size)

## Architecture

This library is designed to be:

1. **Testable** - Pure functions with no external dependencies
2. **Reusable** - Can be published to NPM and used by other projects
3. **Portable** - Works in browsers, Node.js, and could wrap native libraries
4. **Fast** - Minimal overhead, direct PDF operations

Business logic (logging, cost estimation, user quotas) lives in the application layer, not here.
