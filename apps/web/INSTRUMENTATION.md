# Web App Integration

The web app now includes full instrumentation:

## Architecture

```
Home page (index.tsx)
    ↓
mergePdfsWithInstrumentation() (lib/operations.ts)
    ↓
mergePdfs() from @pdf-toolkit/pdf-core
    ↓
Instrumentation.recordOperation() from @pdf-toolkit/operations
    ↓
ConsoleLogger (default, logs to browser console)
```

## What's Tracked

Every merge operation logs:
- **Operation type**: 'merge'
- **File size**: Total bytes of input files
- **Page count**: Pages in merged PDF
- **Duration**: Processing time in milliseconds
- **Cost**: Estimated operational cost (USD)
- **Route**: 'client' (browser-side processing)
- **Timestamp**: When operation completed

## Example Console Output

```
[OperationCost] {
  operation: "merge",
  duration: "245.34ms",
  pages: 42,
  size: "5.23MB",
  cost: "$0.000187",
  route: "client"
}
```

## Next Steps

1. **Supabase Integration** - Connect a database logger to persist operation_costs
2. **User Quotas** - Implement usage limits based on subscription tier
3. **Analytics** - Send events to PostHog or Segment
4. **Error Recovery** - Handle network failures gracefully
5. **Cost Display** - Show user-facing cost estimates

## Adding a Custom Logger

To log to Supabase instead of console:

```typescript
// apps/web/src/lib/supabase-logger.ts
import type { OperationLogger, OperationRecord } from '@pdf-toolkit/operations'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

class SupabaseLogger implements OperationLogger {
  async log(record: OperationRecord) {
    await supabase.from('operation_costs').insert([record])
  }
}

// In _app.tsx:
import { Instrumentation } from '@pdf-toolkit/operations'
const instr = new Instrumentation(new SupabaseLogger())
```
