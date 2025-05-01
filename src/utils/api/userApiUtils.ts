
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
      // Kiểm tra xem cache có còn hiệu lực không
      if (Date.now() - parsedCache.timestamp < cacheValidTime) {
        console.log("[userApiUtils] Khôi phục cache từ sessionStorage", {
          cacheAge: (Date.now() - parsedCache.timestamp) / 1000,
          userCount: parsedCache.data.users.length
        });
        usersCache = parsedCache;
      } else {
        console.log("[userApiUtils] Cache từ sessionStorage đã hết hạn");
      }
    }
  }
} catch (error) {
  console.warn("[userApiUtils] Lỗi khi phân tích cache từ sessionStorage:", error);
}

// Hàm fetchUsers sửa đổi để chỉ lấy dữ liệu cần thiết cho bảng
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
        minimal: true  // Flag để Edge Function biết chỉ trả về dữ liệu tối thiểu
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
        console.log("Phát hiện lỗi xác thực trong phản hồi, thử làm mới token...");
        const newToken = await tokenManager.refreshToken();
        
        if (newToken) {
          console.log("Đã làm mới token, thử gọi lại API...");
          const retryResponse = await supabase.functions.invoke('admin-users', {
            body: {
              ...params,
              minimal: true
            },
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          });
          
          if (retryResponse.error) {
            throw new Error(retryResponse.error.message);
          }
          
          // Lưu vào cache
          usersCache = {
            data: retryResponse.data.data,
            timestamp: Date.now(),
            params: { ...params }
          };
          
          // Lưu cache vào sessionStorage
          try {
            sessionStorage.setItem('users_cache', JSON.stringify(usersCache));
          } catch (err) {
            console.warn("[fetchUsers] Không thể lưu cache vào sessionStorage:", err);
          }
          
          return retryResponse.data.data;
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
    console.error("Lỗi trong fetchUsers:", error);
    
    if (abortSignal?.aborted) {
      console.log("Request bị hủy, không xử lý lỗi");
      throw new Error("Request bị hủy");
    }
    
    // Nếu là lỗi xác thực, thử làm mới token
    if (isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error;
  }
};

// Xóa cache
export const clearUsersCache = () => {
  usersCache = null;
  try {
    sessionStorage.removeItem('users_cache');
    sessionStorage.removeItem('users_data_loaded');
  } catch (err) {
    console.warn("[clearUsersCache] Không thể xóa cache từ sessionStorage:", err);
  }
  console.log("Đã xóa cache người dùng");
};
