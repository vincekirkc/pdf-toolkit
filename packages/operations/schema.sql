-- Schema for tracking PDF operation costs and metrics
-- Use this schema in your database (Supabase PostgreSQL recommended)

CREATE TABLE operation_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Operation metadata
  operation_type VARCHAR NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  page_count INTEGER NOT NULL,
  
  -- Timing
  processing_time_ms INTEGER NOT NULL,
  
  -- Route and cost
  processing_route VARCHAR NOT NULL, -- 'client' or 'server'
  cost_usd DECIMAL(10, 6) NOT NULL,
  
  -- Status
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- User context (optional, filled by application layer)
  user_id UUID,
  subscription_tier VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_operation_costs_user_id ON operation_costs(user_id);
CREATE INDEX idx_operation_costs_created_at ON operation_costs(created_at);
CREATE INDEX idx_operation_costs_operation_type ON operation_costs(operation_type);
CREATE INDEX idx_operation_costs_processing_route ON operation_costs(processing_route);

-- View for cost analytics
CREATE VIEW operation_cost_analytics AS
SELECT
  operation_type,
  processing_route,
  COUNT(*) as operation_count,
  ROUND(AVG(processing_time_ms)::NUMERIC, 2) as avg_duration_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms)::NUMERIC, 2) as p95_duration_ms,
  ROUND(AVG(cost_usd)::NUMERIC, 6) as avg_cost_usd,
  ROUND(SUM(cost_usd)::NUMERIC, 2) as total_cost_usd,
  ROUND(AVG(file_size_bytes) / 1024 / 1024::NUMERIC, 2) as avg_file_size_mb,
  COUNT(*) FILTER (WHERE success = false) as failure_count,
  DATE_TRUNC('hour', created_at) as hour
FROM operation_costs
GROUP BY operation_type, processing_route, DATE_TRUNC('hour', created_at)
ORDER BY DATE_TRUNC('hour', created_at) DESC;

-- View for processing route analysis
CREATE VIEW processing_route_analysis AS
SELECT
  operation_type,
  processing_route,
  COUNT(*) FILTER (WHERE processing_route = 'client') as client_count,
  COUNT(*) FILTER (WHERE processing_route = 'server') as server_count,
  ROUND(
    COUNT(*) FILTER (WHERE processing_route = 'client')::NUMERIC /
    COUNT(*)::NUMERIC * 100,
    2
  ) as client_percentage,
  ROUND(AVG(processing_time_ms) FILTER (WHERE processing_route = 'client')::NUMERIC, 2) as client_avg_ms,
  ROUND(AVG(processing_time_ms) FILTER (WHERE processing_route = 'server')::NUMERIC, 2) as server_avg_ms
FROM operation_costs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY operation_type, processing_route;
