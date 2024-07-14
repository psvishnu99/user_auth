
DO $$
BEGIN
  IF NOT EXISTS (SELECT * 
                 FROM information_schema.columns
                 WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'user_type') THEN
    ALTER TABLE users ADD user_type INT;
  END IF;
END$$;
