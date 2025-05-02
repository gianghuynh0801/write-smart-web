
import { supabase } from "./client";

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
  verification_tokens: any;
}

// Wrapper cải tiến để truy cập các bảng trong Supabase mà không gặp lỗi TypeScript
export const db = {
  // Các bảng
  users: () => supabase.from('users'),
  subscriptions: () => supabase.from('subscriptions'),
  user_subscriptions: () => supabase.from('user_subscriptions'),
  payment_history: () => supabase.from('payment_history'),
  user_roles: () => supabase.from('user_roles'),
  system_configurations: () => supabase.from('system_configurations'),
  articles: () => supabase.from('articles'),
  profiles: () => supabase.from('profiles'),
  verification_tokens: () => supabase.from('verification_tokens'),
  
  // Helper để truy cập bảng tùy chỉnh
  table: (tableName: string) => supabase.from(tableName),

  // Truy xuất các API khác của Supabase
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
  rpc: supabase.rpc.bind(supabase),
};
