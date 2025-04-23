
// Custom types for subscription-related tables
export interface Subscription {
  id: number;
  name: string;
  description: string | null;
  price: number;
  period: string;
  features: string[] | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  subscriptions?: Subscription;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  description: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
}
