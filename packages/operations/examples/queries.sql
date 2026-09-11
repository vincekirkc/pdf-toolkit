// Example: Weekly cost analysis query
// Run this on your database to get cost breakdowns

-- Weekly operation summary
SELECT
  DATE_TRUNC('week', created_at) as week,
  operation_type,
  processing_route,
  COUNT(*) as count,
  ROUND(AVG(processing_time_ms)::NUMERIC, 2) as avg_ms,
  ROUND(AVG(file_size_bytes) / 1024 / 1024::NUMERIC, 2) as avg_mb,
  ROUND(SUM(cost_usd)::NUMERIC, 2) as total_cost,
  ROUND(AVG(cost_usd)::NUMERIC, 6) as avg_cost
FROM operation_costs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('week', created_at), operation_type, processing_route
ORDER BY week DESC, operation_type, processing_route;

-- Find expensive operations (p95+ costs)
SELECT
  operation_type,
  file_size_bytes,
  processing_time_ms,
  cost_usd,
  processing_route,
  created_at
FROM operation_costs
WHERE cost_usd > (
  SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cost_usd)
  FROM operation_costs
  WHERE created_at > NOW() - INTERVAL '7 days'
)
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY cost_usd DESC
LIMIT 50;

-- Check for processing route anomalies
SELECT
  operation_type,
  processing_route,
  COUNT(*) as count,
  ROUND(AVG(processing_time_ms)::NUMERIC, 2) as avg_ms,
  ROUND(MIN(processing_time_ms)::NUMERIC, 2) as min_ms,
  ROUND(MAX(processing_time_ms)::NUMERIC, 2) as max_ms
FROM operation_costs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY operation_type, processing_route
ORDER BY operation_type, avg_ms DESC;
