
import { supabase } from "./client";

// Định nghĩa các type cho các bảng để tránh lỗi TypeScript
export type TableType = {
  users: {
    id: string;
    email: string;
    name?: string;
    credits?: number;
    email_verified?: boolean;
    subscription?: string;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
    avatar_url?: string;
    subscription_end_date?: string;
    subscription_status?: string;
    refreshed_at?: string;
  };
  subscriptions: {
    id: number;
    name: string;
    description?: string;
    price: number;
    period: string;
    features?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  user_subscriptions: {
    id: string;
    user_id: string;
    subscription_id: number;
    start_date: string;
    end_date: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
  payment_history: {
    id?: string;
    user_id: string;
    amount: number;
    status: string;
    description: string;
    payment_at: string;
    created_at?: string;
    updated_at?: string;
  };
  user_roles: {
    id?: string;
    user_id: string;
    role: string;
    created_at?: string;
  };
  system_configurations: {
    id?: string;
    key: string;
    value: string;
    created_at?: string;
    updated_at?: string;
  };
  articles: {
    id?: string;
    title: string;
    content: string;
    user_id: string;
    status: 'draft' | 'published' | 'archived';
    created_at?: string;
    updated_at?: string;
  };
  profiles: {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    created_at?: string;
    updated_at?: string;
  };
  verification_tokens: {
    id?: string;
    user_id: string;
    token: string;
    type: 'email_verification' | 'password_reset';
    expires_at: string;
    created_at?: string;
  };
}

// Wrapper cải tiến để truy cập các bảng trong Supabase mà không gặp lỗi TypeScript
export const db = {
  // Các bảng
  users: () => supabase.from<TableType['users']>('users'),
  subscriptions: () => supabase.from<TableType['subscriptions']>('subscriptions'),
  user_subscriptions: () => supabase.from<TableType['user_subscriptions']>('user_subscriptions'),
  payment_history: () => supabase.from<TableType['payment_history']>('payment_history'),
  user_roles: () => supabase.from<TableType['user_roles']>('user_roles'),
  system_configurations: () => supabase.from<TableType['system_configurations']>('system_configurations'),
  articles: () => supabase.from<TableType['articles']>('articles'),
  profiles: () => supabase.from<TableType['profiles']>('profiles'),
  verification_tokens: () => supabase.from<TableType['verification_tokens']>('verification_tokens'),
  
  // Helper để truy cập bảng tùy chỉnh
  table: <T = any>(tableName: string) => supabase.from<T>(tableName),

  // Truy xuất các API khác của Supabase
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
  rpc: supabase.rpc.bind(supabase),
};
