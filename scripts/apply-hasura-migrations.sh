#!/bin/bash

# Apply Hasura migrations using Docker
echo "Applying Hasura migrations..."

# Apply the initial schema migration
docker-compose exec -T db psql -U ${POSTGRES_USER:-myuser} -d ${POSTGRES_DB:-lab_crm} << 'EOF'
-- Check if migrations are already applied
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Equipment') THEN
    \echo 'Applying initial schema migration...'
    \i /docker-entrypoint-initdb.d/1733000000000_init_schema_up.sql
    \i /docker-entrypoint-initdb.d/1733000000001_add_computed_fields_up.sql
  ELSE
    \echo 'Migrations already applied, skipping...'
  END IF;
END
$$;
EOF

echo "✅ Migrations applied successfully!"

