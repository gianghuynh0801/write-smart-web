
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { parseUser } from "../userParser";
import { authService, isAuthError } from "@/services/authService";

// Function để đợi một khoảng thời gian
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tạo người dùng mới
 * @param userData Thông tin người dùng cần tạo
 * @returns Thông tin người dùng đã tạo
 */
export const createUser = async (userData: UserFormValues): Promise<User> => {
  console.log("[createUser] Tạo user mới với dữ liệu:", userData);
  
  try {
    // Lấy token admin
    const adminToken = await authService.getAdminToken();
    
    console.log("[createUser] Gọi Edge Function với token");
    
    // Gọi Edge Function với token xác thực
    const { data: responseData, error: invocationError } = await supabase.functions.invoke(
      'create-user',
      {
        body: { userData },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (invocationError) {
      console.error("[createUser] Lỗi khi gọi Edge Function:", invocationError);
      
      // Kiểm tra nếu là lỗi xác thực
      if (isAuthError(invocationError)) {
        // Làm mới token và thử lại
        const newToken = await authService.getAdminToken(true);
        
        if (newToken) {
          console.log("[createUser] Thử lại với token mới");
          const { data: retryData, error: retryError } = await supabase.functions.invoke(
            'create-user',
            {
              body: { userData },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) {
            throw new Error(`Lỗi tạo user: ${retryError.message}`);
          }
          
          if (retryData?.data) {
            return parseUser(retryData.data);
          }
        }
      }
      
      throw new Error(`Lỗi tạo user: ${invocationError.message}`);
    }
    
    // Kiểm tra phản hồi từ Edge Function
    if (!responseData) {
      console.error("[createUser] Edge Function không trả về dữ liệu");
      throw new Error("Không nhận được dữ liệu từ máy chủ");
    }
    
    if (responseData.error) {
      console.error("[createUser] Edge Function trả về lỗi:", responseData.error);
      
      if (isAuthError(new Error(responseData.error))) {
        await authService.getAdminToken(true);
      }
      
      throw new Error(`Lỗi tạo user: ${responseData.error}`);
    }

    if (!responseData.data) {
      console.error("[createUser] Edge Function không trả về dữ liệu user");
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }

    // Phân tích và trả về dữ liệu người dùng đã tạo
    const createdUser = parseUser(responseData.data);
    return createdUser;
  } catch (error) {
    console.error("[createUser] Lỗi không mong đợi:", error);
    
    // Nếu có lỗi xác thực, cố gắng làm mới phiên đăng nhập
    if (isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error;
  }
};
