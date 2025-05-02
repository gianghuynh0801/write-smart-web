
import { supabase } from "./client";

// Một wrapper đơn giản để truy cập các bảng trong Supabase mà không gặp lỗi TypeScript
export const db = {
  // Các bảng
  users: () => supabase.from('users'),
  subscriptions: () => supabase.from('subscriptions'),
  user_subscriptions: () => supabase.from('user_subscriptions'),
  payment_history: () => supabase.from('payment_history'),
  user_roles: () => supabase.from('user_roles'),
  
  // Helper để truy cập bảng tùy chỉnh
  table: (tableName: string) => supabase.from(tableName),

  // Truy xuất các API khác của Supabase
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
  rpc: supabase.rpc.bind(supabase),
};
