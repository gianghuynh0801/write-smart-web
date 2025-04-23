
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
