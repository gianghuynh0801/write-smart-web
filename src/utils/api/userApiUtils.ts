
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { authService, AuthErrorType, AuthError, isAuthError } from "@/services/authService";
import { tokenManager } from "@/utils/tokenManager";
import { featureFlags } from "@/config/featureFlags";

// Định nghĩa kiểu dữ liệu cho cache
export interface UsersCache {
  data: {
    users: User[];
    total: number;
  };
  timestamp: number;
  params: {
    page: number;
    pageSize: number;
    status: string;
    searchTerm: string;
  };
}

// Sử dụng thời gian cache từ featureFlags
export const cacheValidTime = featureFlags.cacheValidTimeMs || 300000; // Mặc định 5 phút
export let usersCache: UsersCache | null = null;

// Cố gắng lấy cache từ sessionStorage khi module được import lần đầu
try {
  const sessionCache = sessionStorage.getItem('users_cache');
  if (sessionCache) {
    const parsedCache = JSON.parse(sessionCache);
    // Kiểm tra xem cache có hợp lệ không
    if (parsedCache && parsedCache.data && parsedCache.timestamp) {
      // Kiểm tra xem cache có còn hiệu lực không - giữ nguyên validation nhưng tăng log
      const cacheAge = Date.now() - parsedCache.timestamp;
      const isValid = cacheAge < cacheValidTime;
      console.log("[userApiUtils] Kiểm tra cache từ sessionStorage", {
        cacheAge: cacheAge / 1000,
        userCount: parsedCache.data.users.length,
        isValid
      });
      
      if (isValid) {
        usersCache = parsedCache;
      } else {
        console.log("[userApiUtils] Cache từ sessionStorage đã hết hạn");
      }
    }
  }
} catch (error) {
  console.warn("[userApiUtils] Lỗi khi phân tích cache từ sessionStorage:", error);
}

// Hàm fetchUsers sửa đổi để xử lý lỗi và retry tốt hơn
export const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}, abortSignal?: AbortSignal) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  // Kiểm tra cache trước
  const now = Date.now();
  if (usersCache && 
      now - usersCache.timestamp < cacheValidTime &&
      usersCache.params.page === params.page &&
      usersCache.params.pageSize === params.pageSize &&
      usersCache.params.status === params.status &&
      usersCache.params.searchTerm === params.searchTerm) {
    console.log("Sử dụng kết quả từ cache", {
      cacheAge: (now - usersCache.timestamp) / 1000,
      userCount: usersCache.data.users.length
    });
    return usersCache.data;
  }

  // Theo dõi số lần thử lại
  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    try {
      // Lấy admin token từ TokenManager
      const token = await tokenManager.getToken();
      if (!token) {
        throw new AuthError(
          "Không có phiên đăng nhập hợp lệ", 
          AuthErrorType.TOKEN_EXPIRED
        );
      }

      // Gọi Edge Function với tham số minimal=true để chỉ lấy dữ liệu tối thiểu
      const apiPromise = supabase.functions.invoke('admin-users', {
        body: {
          ...params,
          minimal: true,  // Flag để Edge Function biết chỉ trả về dữ liệu tối thiểu
          timestamp: Date.now() // Thêm timestamp để tránh cache
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Tạo timeout promise với thời gian dài hơn để tránh timeout quá nhanh
      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error('Timeout khi lấy danh sách người dùng'));
        }, 30000); // Tăng lên 30 giây để tránh timeout quá sớm
        
        // Xóa timeout nếu có abort signal
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            clearTimeout(id);
            reject(new Error('Request bị hủy'));
          });
        }
      });
      
      // Sử dụng Promise.race để áp dụng timeout
      const { data, error } = await Promise.race([
        apiPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error("Lỗi khi gọi admin-users function:", error);
        
        // Kiểm tra lỗi xác thực và thử làm mới token
        if (isAuthError(error)) {
          if (retries < maxRetries) {
            retries++;
            console.log(`[fetchUsers] Phát hiện lỗi xác thực, thử làm mới token... (lần ${retries}/${maxRetries})`);
            const newToken = await tokenManager.refreshToken();
            
            if (!newToken) {
              console.error("[fetchUsers] Không thể làm mới token");
              throw new Error("Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.");
            }
            
            console.log("[fetchUsers] Đã làm mới token thành công, thử lại...");
            continue; // Thử lại vòng lặp với token mới
          }
        }
        
        throw error;
      }

      if (data.error) {
        console.error("admin-users function trả về lỗi:", data.error);
        throw new Error(data.error);
      }

      console.log(`Đã lấy được ${data.data.users.length} người dùng, tổng số: ${data.data.total}`);
      
      // Lưu vào cache
      usersCache = {
        data: data.data,
        timestamp: Date.now(),
        params: { ...params }
      };
      
      // Lưu cache vào sessionStorage
      try {
        sessionStorage.setItem('users_cache', JSON.stringify(usersCache));
      } catch (err) {
        console.warn("[fetchUsers] Không thể lưu cache vào sessionStorage:", err);
      }
      
      return data.data;
    } catch (error) {
      if (abortSignal?.aborted) {
        console.log("Request bị hủy, không xử lý lỗi");
        throw new Error("Request bị hủy");
      }

      // Nếu đã thử lại tối đa số lần hoặc không phải lỗi xác thực, throw lỗi
      if (retries >= maxRetries || !isAuthError(error)) {
        console.error("[fetchUsers] Lỗi không thể khắc phục sau khi thử lại:", error);
        throw error; 
      }

      // Tăng số lần thử lại cho lần tiếp theo nếu là lỗi xác thực
      retries++;
      console.log(`[fetchUsers] Thử lại lần ${retries}/${maxRetries} sau lỗi: ${error.message}`);

      // Đợi một chút trước khi thử lại để tránh spam yêu cầu
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Mã này không bao giờ được thực thi vì while loop sẽ hoặc return kết quả hoặc throw lỗi
  throw new Error("Lỗi không xác định khi lấy danh sách người dùng");
};

// Xóa cache
export const clearUsersCache = () => {
  usersCache = null;
  try {
    sessionStorage.removeItem('users_cache');
    sessionStorage.removeItem('users_data_loaded');
    sessionStorage.removeItem('dashboard_stats');
    console.log("Đã xóa cache người dùng");
  } catch (err) {
    console.warn("[clearUsersCache] Không thể xóa cache từ sessionStorage:", err);
  }
};

// Xóa cache người dùng cụ thể
export const clearUserCache = (userId: string | number) => {
  const cacheKey = `user_details_${userId}`;
  try {
    sessionStorage.removeItem(cacheKey);
    sessionStorage.removeItem('dashboard_stats');
    console.log(`[clearUserCache] Đã xóa cache cho user ID: ${userId}`);
  } catch (err) {
    console.warn(`[clearUserCache] Không thể xóa cache cho user ID: ${userId}`, err);
  }
};

// Xóa toàn bộ cache liên quan đến người dùng
export const clearAllUserCache = () => {
  try {
    // Xóa cache danh sách người dùng
    clearUsersCache();
    sessionStorage.removeItem('dashboard_stats');
    
    // Xóa tất cả các mục cache chi tiết người dùng
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('user_details_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`[clearAllUserCache] Đã xóa cache: ${key}`);
    });
    
    console.log(`[clearAllUserCache] Đã xóa ${keysToRemove.length} mục cache chi tiết người dùng`);
  } catch (err) {
    console.warn("[clearAllUserCache] Lỗi khi xóa cache:", err);
  }
};

// Xóa cache dashboard stats
export const clearDashboardCache = () => {
  try {
    sessionStorage.removeItem('dashboard_stats');
    console.log("[clearDashboardCache] Đã xóa cache dashboard stats");
  } catch (err) {
    console.warn("[clearDashboardCache] Không thể xóa cache dashboard stats:", err);
  }
};
