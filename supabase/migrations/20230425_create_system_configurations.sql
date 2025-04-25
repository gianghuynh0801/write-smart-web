
-- Tạo bảng system_configurations nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS public.system_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm RLS policies
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Tạo policy để chỉ admin mới có thể xem và chỉnh sửa
CREATE POLICY "Admin can view configurations" ON public.system_configurations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert configurations" ON public.system_configurations 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update configurations" ON public.system_configurations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
