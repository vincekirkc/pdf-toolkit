// Example implementation: Supabase Logger
// This shows how to implement OperationLogger for Supabase PostgreSQL

// packages/operations/examples/supabase-logger.ts

import type { OperationLogger, OperationRecord } from '../src'

// Example: connect to Supabase
// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// )

// export class SupabaseOperationLogger implements OperationLogger {
//   async log(record: OperationRecord): Promise<void> {
//     const { error } = await supabase
//       .from('operation_costs')
//       .insert([
//         {
//           operation_type: record.operationType,
//           file_size_bytes: record.fileSizeBytes,
//           page_count: record.pageCount,
//           processing_time_ms: record.durationMs,
//           processing_route: record.processingRoute,
//           cost_usd: record.costUsd,
//           success: record.success,
//           error_message: record.errorMessage,
//           created_at: record.timestamp,
//         },
//       ])

//     if (error) {
//       console.error('Failed to log operation:', error)
//       // Optionally: track this error, retry, etc.
//     }
//   }
// }
