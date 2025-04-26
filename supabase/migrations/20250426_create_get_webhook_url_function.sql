
-- Tạo hàm RPC để đọc webhook URL mà không cần qua RLS policy
CREATE OR REPLACE FUNCTION public.get_webhook_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url TEXT;
BEGIN
  SELECT value INTO webhook_url
  FROM system_configurations
  WHERE key = 'webhook_url'
  LIMIT 1;
  
  RETURN webhook_url;
END;
$$;

-- Cấp quyền cho authenticated users gọi hàm này
GRANT EXECUTE ON FUNCTION public.get_webhook_url() TO authenticated;
