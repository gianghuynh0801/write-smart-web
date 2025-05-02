
import { db } from "@/integrations/supabase/typeSafeClient";
import { parseSubscriptionFeatures } from "./utils";
import { Subscription } from "@/types/subscriptions";

export const fetchSubscriptionPlans = async (): Promise<Subscription[]> => {
  const { data, error } = await db.subscriptions()
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Lỗi khi lấy danh sách gói:", error);
    throw new Error(`Error fetching subscription plans: ${error.message}`);
  }

  return (data || []).map((row) => {
    // Thêm kiểm tra null rõ ràng
    if (!row) return {} as Subscription;
    
    // Kiểm tra null trước khi truy cập thuộc tính
    const features = row && typeof row === 'object' && 'features' in row ? 
      parseSubscriptionFeatures(((row as any).features) || []) : [];
      
    return {
      ...((row as any) || {}),
      features
    } as Subscription;
  });
};

export const fetchUserSubscription = async (userId: string) => {
  console.log("Đang lấy thông tin gói đăng ký cho user:", userId);
  
  try {
    const { data, error } = await db.user_subscriptions()
      .select(`
        id,
        user_id,
        subscription_id,
        start_date,
        end_date,
        status,
        subscriptions:subscription_id (
          id,
          name,
          price,
          period,
          features,
          description
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi lấy thông tin gói đăng ký:", error);
      return {
        plan: "Không có",
        planId: null,
        status: "inactive",
        startDate: "",
        endDate: "",
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    if (!data) {
      console.log("Không tìm thấy gói đăng ký đang hoạt động");
      return {
        plan: "Không có",
        planId: null,
        status: "inactive",
        startDate: "",
        endDate: "",
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    // Sử dụng kiểm tra an toàn để tránh lỗi
    const dataAny = data as any;
    const subscription = dataAny && typeof dataAny === 'object' && 'subscriptions' in dataAny ? 
      dataAny.subscriptions : null;
    
    if (!subscription) {
      console.error("Không tìm thấy thông tin chi tiết gói đăng ký");
      return {
        plan: "Lỗi",
        planId: dataAny && typeof dataAny === 'object' && 'subscription_id' in dataAny ? dataAny.subscription_id : null,
        status: dataAny && typeof dataAny === 'object' && 'status' in dataAny ? dataAny.status : 'inactive',
        startDate: dataAny && typeof dataAny === 'object' && 'start_date' in dataAny ? dataAny.start_date : '',
        endDate: dataAny && typeof dataAny === 'object' && 'end_date' in dataAny ? dataAny.end_date : '',
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    const usageStats = {
      used: 8,
      total: 30
    };

    console.log("Đã lấy thông tin gói đăng ký thành công:", {
      plan: subscription.name,
      status: dataAny.status,
      startDate: dataAny.start_date,
      endDate: dataAny.end_date
    });

    return {
      plan: subscription.name,
      planId: subscription.id,
      status: dataAny.status,
      startDate: dataAny.start_date,
      endDate: dataAny.end_date,
      price: subscription.price,
      usageArticles: usageStats.used,
      totalArticles: usageStats.total
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      plan: "Lỗi",
      planId: null,
      status: "error",
      startDate: "",
      endDate: "",
      price: 0,
      usageArticles: 0,
      totalArticles: 0
    };
  }
};
