import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userParser";
import { User } from "@/types/user";
import { getUserActiveSubscription } from "./admin/subscriptionOperations";

export const fetchUsers = async (
  page = 1,
  pageSize = 5,
  status: string = "all",
  searchTerm: string = ""
): Promise<{ data: User[]; total: number }> => {
  try {
    console.log("Đang lấy danh sách người dùng với các thông số:", { page, pageSize, status, searchTerm });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

    const response = await supabase.functions.invoke('admin-users', {
      method: 'POST',
      body: {
        page,
        pageSize,
        status,
        searchTerm,
        minimal: true // Thêm flag để lấy dữ liệu tối thiểu
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (response.error) {
      console.error("Lỗi từ Edge Function:", response.error);
      throw new Error(`Lỗi API: ${response.error.message}`);
    }

    if (!response.data) {
      console.log("Không có dữ liệu trả về từ API");
      return {
        data: [],
        total: 0
      };
    }

    const { data: users, total } = response.data;
    
    console.log(`Đã lấy được ${users?.length || 0} người dùng, tổng số: ${total || 0}`);
    
    return {
      data: users || [],
      total: total || 0
    };
  } catch (error) {
    console.error("Lỗi không mong muốn khi lấy danh sách users:", error);
    throw error;
  }
};

export const getUserById = async (id: string | number, forceRefresh = false): Promise<User | undefined> => {
  try {
    console.log("Đang lấy thông tin chi tiết của user:", id, "forceRefresh:", forceRefresh);
    
    // Tạo cache key
    const cacheKey = `user_details_${id}`;
    
    // Thử lấy từ sessionStorage trước nếu không yêu cầu tải mới
    if (!forceRefresh) {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const userData = JSON.parse(cachedData);
          if (userData && userData.id) {
            console.log("Sử dụng dữ liệu người dùng từ cache:", userData.id);
            return userData as User;
          }
        } catch (err) {
          console.warn("Lỗi khi parse dữ liệu cache:", err);
        }
      }
    } else {
      console.log(`Bỏ qua cache và tải mới dữ liệu cho user: ${id}`);
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

    const response = await supabase.functions.invoke('get-user-details', {
      body: { userId: id },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (response.error) {
      console.error("Lỗi từ Edge Function:", response.error);
      throw new Error(`Lỗi khi lấy thông tin user: ${response.error.message}`);
    }

    if (!response.data) {
      console.log("Không tìm thấy thông tin user");
      return undefined;
    }

    const userWithSubscription = parseUser(response.data);
    console.log("Đã lấy được thông tin user:", userWithSubscription);
    
    // Lưu vào cache
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(userWithSubscription));
      console.log(`Đã lưu dữ liệu user ${id} vào cache`);
    } catch (err) {
      console.warn("Không thể lưu user vào cache:", err);
    }
    
    return userWithSubscription;
  } catch (error) {
    console.error("Lỗi không mong muốn khi lấy thông tin user:", error);
    throw error;
  }
};
