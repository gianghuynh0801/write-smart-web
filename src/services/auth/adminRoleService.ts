
import { supabase } from "@/integrations/supabase/client";

class AdminRoleService {
  private static instance: AdminRoleService;
  private adminUserIds: Map<string, boolean> = new Map();
  private lastChecks: Map<string, number> = new Map();
  private cacheDuration = 10 * 60 * 1000; // 10 phút
  
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
      const lastCheck = this.lastChecks.get(userId) || 0;
      const now = Date.now();
      
      // Cache còn hiệu lực
      if (now - lastCheck < this.cacheDuration) {
        return this.adminUserIds.get(userId) || false;
      }
    }

    try {
      console.log("Kiểm tra quyền admin cho user:", userId);
      
      // Thử từng phương thức kiểm tra admin một cách tuần tự với cơ chế fallback
      
      // 1. Gọi RPC function is_admin từ database
      try {
        const { data, error } = await supabase.rpc('is_admin', { uid: userId });
        
        if (error) {
          console.error("Lỗi khi kiểm tra quyền admin qua RPC:", error);
        } else if (data === true) {
          // Cache kết quả để sử dụng lại
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi ngoại lệ khi kiểm tra quyền admin qua RPC:", error);
      }
      
      // 2. Kiểm tra từ bảng user_roles trong schema seo_project
      try {
        const { data, error } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) {
          console.error("Lỗi khi kiểm tra bảng seo_project.user_roles:", error);
        } else if (data) {
          // Cache kết quả để sử dụng lại
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi ngoại lệ khi kiểm tra bảng seo_project.user_roles:", error);
      }
      
      // 3. Kiểm tra từ bảng user_roles trong schema public nếu trước đó không tìm thấy
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) {
          console.error("Lỗi khi kiểm tra bảng public.user_roles:", error);
        } else if (data) {
          // Cache kết quả để sử dụng lại
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi ngoại lệ khi kiểm tra bảng public.user_roles:", error);
      }
      
      // 4. Kiểm tra từ bảng users trong schema public
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error("Lỗi khi kiểm tra bảng users:", error);
        } else if (data?.role === 'admin') {
          // Cache kết quả để sử dụng lại
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi ngoại lệ khi kiểm tra bảng users:", error);
      }
      
      // 5. Kiểm tra từ bảng users trong schema seo_project
      try {
        const { data, error } = await supabase
          .from('seo_project.users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error("Lỗi khi kiểm tra bảng seo_project.users:", error);
        } else if (data?.role === 'admin') {
          // Cache kết quả để sử dụng lại
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi ngoại lệ khi kiểm tra bảng seo_project.users:", error);
      }
      
      // Không tìm thấy quyền admin qua bất kỳ phương thức nào
      this.adminUserIds.set(userId, false);
      this.lastChecks.set(userId, Date.now());
      return false;
    } catch (error) {
      console.error("Lỗi không mong đợi khi kiểm tra quyền admin:", error);
      return false;
    }
  }

  // Xóa cache cho một user ID cụ thể
  public clearCache(userId: string): void {
    this.adminUserIds.delete(userId);
    this.lastChecks.delete(userId);
  }

  // Xóa toàn bộ cache
  public clearAllCache(): void {
    this.adminUserIds.clear();
    this.lastChecks.clear();
  }

  // Thay đổi thời gian cache tùy chỉnh (đơn vị: mili giây)
  public setCacheDuration(durationMs: number): void {
    if (durationMs > 0) {
      this.cacheDuration = durationMs;
    }
  }
}

// Export instance singleton
export const adminRoleService = AdminRoleService.getInstance();
