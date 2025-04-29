
export interface SubscriptionUpdateResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionCancelResponse {
  success: boolean;
  message: string;
}

// Thêm interface cho trạng thái đăng ký hiện tại
export interface SubscriptionStatus {
  plan: string;
  planId: number | null;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  usageArticles: number;
  totalArticles: number;
}

// Thêm interface cho thông tin các gói đăng ký
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  period: string;
  features: string[] | null;
}

// Response khi tạo hoặc đồng bộ dữ liệu người dùng
export interface UserSyncResponse {
  success: boolean;
  message: string;
  userId?: string;
  userCreated?: boolean;
  warnings?: string[];
}
