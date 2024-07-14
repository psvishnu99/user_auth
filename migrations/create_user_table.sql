

BEGIN;

-- Check if the table already exists to prevent duplicate creation
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a unique index on the email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'users_email_key'
        AND n.nspname = 'public'
    ) THEN
        CREATE UNIQUE INDEX users_email_key ON users (email);
    END IF;
END $$;

COMMIT;