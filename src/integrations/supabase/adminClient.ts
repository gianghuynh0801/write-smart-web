
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lxhawtndkubaeljbaylp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGF3dG5ka3ViYWVsamJheWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM5OTExMSwiZXhwIjoyMDYwOTc1MTExfQ.45jE1xZGfgrzLgLzI_TKwNmjU-SZk1stmxzL0i86W_U";

// Tạo Supabase client với service role key để bypass RLS khi cần thiết
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,  // Không lưu session cho admin client
      autoRefreshToken: false,
    }
  }
);
