
import { supabase } from "@/integrations/supabase/client";
import { authService, isAuthError } from "@/services/auth";

/**
 * Tạo hoặc cập nhật gói đăng ký cho người dùng với quyền admin
 */
export const createUserSubscriptionAsAdmin = async (
  userId: string,
  subscriptionId: number,
  startDate: string,
  endDate: string,
  status: string
): Promise<void> => {
  try {
    console.log(`[createUserSubscriptionAsAdmin] Thiết lập gói đăng ký ${subscriptionId} cho user ${userId}`);
    
    // Nếu subscriptionId < 0, hủy tất cả gói đăng ký hiện tại
    if (subscriptionId < 0) {
      const adminToken = await authService.getAdminToken();
      
      const { error } = await supabase.functions.invoke(
        'admin-subscription',
        {
          body: { 
            action: 'deactivate-all', 
            userId,
          },
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      if (error) {
        console.error(`[createUserSubscriptionAsAdmin] Lỗi khi hủy gói đăng ký: ${error.message}`);
        
        // Kiểm tra lỗi xác thực và thử lại
        if (isAuthError(error)) {
          const newToken = await authService.getAdminToken(true);
          
          const { error: retryError } = await supabase.functions.invoke(
            'admin-subscription',
            {
              body: { 
                action: 'deactivate-all', 
                userId,
              },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      
      return;
    }
    
    // Tạo gói đăng ký mới
    const adminToken = await authService.getAdminToken();
    
    const { error } = await supabase.functions.invoke(
      'admin-subscription',
      {
        body: { 
          action: 'create', 
          userId,
          subscriptionId,
          startDate,
          endDate,
          status
        },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    if (error) {
      console.error(`[createUserSubscriptionAsAdmin] Lỗi khi tạo gói đăng ký: ${error.message}`);
      
      // Kiểm tra lỗi xác thực và thử lại
      if (isAuthError(error)) {
        const newToken = await authService.getAdminToken(true);
        
        const { error: retryError } = await supabase.functions.invoke(
          'admin-subscription',
          {
            body: { 
              action: 'create', 
              userId,
              subscriptionId,
              startDate,
              endDate,
              status
            },
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          }
        );
        
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`[createUserSubscriptionAsAdmin] Lỗi không mong đợi: ${error}`);
    throw error;
  }
};

/**
 * Lấy gói đăng ký đang hoạt động của người dùng
 */
export const getUserActiveSubscription = async (userId: string) => {
  try {
    console.log(`[getUserActiveSubscription] Lấy gói đăng ký cho user ${userId}`);
    
    const adminToken = await authService.getAdminToken();
    
    const { data, error } = await supabase.functions.invoke(
      'admin-subscription',
      {
        body: { 
          action: 'get-active', 
          userId 
        },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    if (error) {
      console.error(`[getUserActiveSubscription] Lỗi: ${error.message}`);
      
      // Kiểm tra lỗi xác thực và thử lại
      if (isAuthError(error)) {
        const newToken = await authService.getAdminToken(true);
        
        const { data: retryData, error: retryError } = await supabase.functions.invoke(
          'admin-subscription',
          {
            body: { 
              action: 'get-active', 
              userId 
            },
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          }
        );
        
        if (retryError) throw retryError;
        return retryData;
      } else {
        throw error;
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[getUserActiveSubscription] Lỗi không mong đợi: ${error}`);
    throw error;
  }
};
