-- Add SUGGESTION to ComplaintType enum
-- ALTER TYPE ADD VALUE is non-transactional in PostgreSQL; IF NOT EXISTS prevents errors on re-run
ALTER TYPE "ComplaintType" ADD VALUE IF NOT EXISTS 'SUGGESTION';
