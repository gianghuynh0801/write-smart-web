
-- Tạo policy mới để cho phép tất cả người dùng đã xác thực có thể xem cấu hình webhook_url
CREATE POLICY "Authenticated users can view webhook_url" ON public.system_configurations 
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND key = 'webhook_url'
  );
