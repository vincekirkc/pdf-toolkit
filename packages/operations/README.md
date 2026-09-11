# @pdf-toolkit/operations

Orchestration and instrumentation layer for pdf-toolkit.

## Philosophy

`operations` wraps `@pdf-toolkit/pdf-core` with business logic:

- ✅ Cost estimation (based on operation type, file size, duration)
- ✅ Operation logging (instrumentation)
- ✅ Processing route decisions (client vs server)
- ✅ Analytics integration points
- ✅ Error handling and recovery

## Architecture

```
Application Layer (web app, extension)
        ↓
Operations Layer (this package)
        ↓ recordOperation()
Instrumentation (logger, cost estimator)
        ↓
pdf-core (pure PDF operations)
```

## Usage

```typescript
import { mergePdfs } from '@pdf-toolkit/pdf-core'
import { getInstrumentation } from '@pdf-toolkit/operations'

const instr = getInstrumentation()

// Call pdf-core directly
const result = await mergePdfs(files, { measure: true })

// Record the operation with instrumentation
await instr.recordOperation(
  'merge',
  {
    durationMs: result.durationMs,
    fileSizeBytes: totalSize,
    pageCount: result.pageCount,
  },
  'client' // processing route
)
```

## Custom Logger

To log to your database:

```typescript
import { Instrumentation, OperationLogger } from '@pdf-toolkit/operations'

class DatabaseLogger implements OperationLogger {
  async log(record: OperationRecord): Promise<void> {
    await db.operationCosts.insert(record)
  }
}

const instr = new Instrumentation(new DatabaseLogger())
```

## Cost Estimation

Costs are estimated based on:
- Base operation cost (fixed)
- Compute time (variable, per millisecond)
- File size (variable, per MB)

Adjust `COST_CONFIG` in `cost-estimator.ts` as you monitor real infrastructure costs.
