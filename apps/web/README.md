# Web App

Next.js web application for pdf-toolkit.

## Getting Started

```bash
cd apps/web
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

- Uses `@pdf-toolkit/pdf-core` for PDF operations
- All PDF processing happens client-side (no backend required yet)
- Performance is measured using `performance.now()`
- Results are displayed with timing information

## First Vertical Slice

This page implements the first MVP:

1. Open website
2. Select 2 PDFs
3. Merge
4. Measure with `performance.now()`
5. Download merged PDF
6. Show "Merged in X.XXms"

## Next Steps

- Add instrumentation layer (database logging)
- Add auth (Clerk)
- Add pricing/subscription
- Add more operations (split, rotate, compress)
