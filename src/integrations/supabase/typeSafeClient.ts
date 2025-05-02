
import { supabase } from "./client";
import { PostgrestQueryBuilder } from "@supabase/supabase-js";

// Định nghĩa các type cho các bảng để tránh lỗi TypeScript
export type TableType = {
  users: any;
  subscriptions: any;
  user_subscriptions: any;
  payment_history: any;
  user_roles: any;
  system_configurations: any;
  articles: any;
  profiles: any;
}

// Wrapper cải tiến để truy cập các bảng trong Supabase mà không gặp lỗi TypeScript
export const db = {
  // Các bảng
  users: () => supabase.from('users') as unknown as PostgrestQueryBuilder<any, any, any>,
  subscriptions: () => supabase.from('subscriptions') as unknown as PostgrestQueryBuilder<any, any, any>,
  user_subscriptions: () => supabase.from('user_subscriptions') as unknown as PostgrestQueryBuilder<any, any, any>,
  payment_history: () => supabase.from('payment_history') as unknown as PostgrestQueryBuilder<any, any, any>,
  user_roles: () => supabase.from('user_roles') as unknown as PostgrestQueryBuilder<any, any, any>,
  system_configurations: () => supabase.from('system_configurations') as unknown as PostgrestQueryBuilder<any, any, any>,
  
  // Helper để truy cập bảng tùy chỉnh
  table: (tableName: string) => supabase.from(tableName) as unknown as PostgrestQueryBuilder<any, any, any>,

  // Truy xuất các API khác của Supabase
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
  rpc: supabase.rpc.bind(supabase),
};

