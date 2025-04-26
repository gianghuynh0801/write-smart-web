
-- Create a trigger function to delete verification tokens when a user is deleted
CREATE OR REPLACE FUNCTION clean_up_user_verification_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all verification tokens for the user being deleted
  DELETE FROM verification_tokens WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS user_delete_cleanup ON users;
CREATE TRIGGER user_delete_cleanup
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION clean_up_user_verification_tokens();

-- Add site_url and site_name to system_configurations if they don't exist
INSERT INTO system_configurations (key, value)
VALUES 
  ('site_url', 'https://lxhawtndkubaeljbaylp.supabase.co'),
  ('site_name', 'WriteSmart')
ON CONFLICT (key) DO NOTHING;
