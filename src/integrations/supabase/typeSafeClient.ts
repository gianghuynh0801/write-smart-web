
import { supabase } from "./client";
import { Database } from "./database.types";

// Wrapper cải tiến để truy cập các bảng trong Supabase
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
  table: <T = any>(tableName: string) => supabase.from(tableName),

  // Truy xuất các API khác của Supabase
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
  rpc: supabase.rpc.bind(supabase),
};

// Các helper functions để xử lý dữ liệu khi không chắc chắn kiểu
export const safeString = <T>(obj: T | null | undefined, key: keyof T & string): string => {
  if (!obj || typeof obj !== 'object') return '';
  const value = obj[key];
  return value ? String(value) : '';
};

export const safeNumber = <T>(obj: T | null | undefined, key: keyof T & string): number => {
  if (!obj || typeof obj !== 'object') return 0;
  const value = obj[key];
  return value !== undefined && value !== null ? Number(value) : 0;
};

export const safeBoolean = <T>(obj: T | null | undefined, key: keyof T & string): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  const value = obj[key];
  return Boolean(value);
};
