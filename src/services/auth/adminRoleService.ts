
import { supabase } from "@/integrations/supabase/client";

class AdminRoleService {
  private static instance: AdminRoleService;
  private adminUserIds: Map<string, boolean> = new Map();
  
  private constructor() {}

  // Singleton pattern
  public static getInstance(): AdminRoleService {
    if (!AdminRoleService.instance) {
      AdminRoleService.instance = new AdminRoleService();
    }
    return AdminRoleService.instance;
  }

  // Kiểm tra quyền admin cho một người dùng
  public async checkAdminStatus(userId: string): Promise<boolean> {
    // Kiểm tra cache trước
    if (this.adminUserIds.has(userId)) {
      return this.adminUserIds.get(userId) || false;
    }

    try {
      console.log("Kiểm tra quyền admin cho user:", userId);
      
      // Gọi RPC function is_admin từ database
      const { data, error } = await supabase.rpc('is_admin', { uid: userId });
      
      if (error) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        return false;
      }
      
      // Cache kết quả để sử dụng lại
      this.adminUserIds.set(userId, !!data);
      
      return !!data;
    } catch (error) {
      console.error("Lỗi không mong đợi khi kiểm tra quyền admin:", error);
      return false;
    }
  }

  // Xóa cache cho một user ID cụ thể
  public clearCache(userId: string): void {
    this.adminUserIds.delete(userId);
  }

  // Xóa toàn bộ cache
  public clearAllCache(): void {
    this.adminUserIds.clear();
  }
}

// Export instance singleton
export const adminRoleService = AdminRoleService.getInstance();
