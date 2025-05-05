
import { supabase } from "@/integrations/supabase/client";

/**
 * Dịch vụ quản lý và kiểm tra quyền admin - sử dụng mẫu Singleton
 */
class AdminRoleService {
  private static instance: AdminRoleService;
  private adminUserIds: Map<string, boolean> = new Map();
  private lastChecks: Map<string, number> = new Map();
  private cacheDuration = 10 * 60 * 1000; // 10 phút
  
  private constructor() {}

  /**
   * Lấy instance của dịch vụ AdminRoleService (Singleton pattern)
   */
  public static getInstance(): AdminRoleService {
    if (!AdminRoleService.instance) {
      AdminRoleService.instance = new AdminRoleService();
    }
    return AdminRoleService.instance;
  }

  /**
   * Kiểm tra nhanh quyền admin cho một người dùng (sử dụng cache)
   * @param userId ID của người dùng cần kiểm tra
   * @returns Promise<boolean> True nếu là admin, false nếu không phải
   */
  public async checkAdminStatus(userId: string): Promise<boolean> {
    if (!userId) return false;
    
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
      // Thay đổi thứ tự ưu tiên để kiểm tra seo_project schema trước
      
      // 1. Kiểm tra từ bảng seo_project.users
      try {
        const { data: userData, error: userError } = await supabase
          .from('seo_project.users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          console.log("Admin role found in seo_project.users table:", userData);
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bảng seo_project.users:", error);
      }
      
      // 2. Kiểm tra từ bảng seo_project.user_roles
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bảng seo_project.user_roles:", error);
      }
      
      // 3. Gọi RPC function is_admin từ database (nếu có)
      try {
        const { data, error } = await supabase.rpc('is_admin', { uid: userId });
        
        if (!error && data === true) {
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra quyền admin qua RPC:", error);
      }
      
      // 4. Kiểm tra từ bảng users trong schema public nếu các phương thức trước không thành công
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!error && data?.role === 'admin') {
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bảng users:", error);
      }
      
      // 5. Kiểm tra từ bảng user_roles trong schema public nếu có
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!error && data) {
          this.adminUserIds.set(userId, true);
          this.lastChecks.set(userId, Date.now());
          return true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bảng public.user_roles:", error);
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

  /**
   * Lấy dữ liệu đầy đủ về quyền admin
   * @param userId ID người dùng cần kiểm tra
   * @returns Object chứa thông tin về quyền admin và lỗi nếu có
   */
  public async getAdminRoleData(userId: string) {
    console.log("Lấy dữ liệu quyền admin cho user:", userId);
    
    try {
      // Thử từng phương thức kiểm tra admin một cách tuần tự với cơ chế fallback
      // Thay đổi thứ tự ưu tiên kiểm tra seo_project schema trước
      
      // 1. Kiểm tra từ bảng seo_project.users
      try {
        const { data: userData, error: userError } = await supabase
          .from('seo_project.users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          console.log("Admin role found in seo_project.users table:", userData);
          return { 
            roleData: { user_id: userId, role: 'admin' }, 
            roleError: null 
          };
        }
      } catch (err) {
        console.log("Error checking admin role in seo_project.users table:", err);
      }
      
      // 2. Kiểm tra từ bảng seo_project.user_roles
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          return { roleData, roleError: null };
        }
      } catch (err) {
        console.log("Error checking admin role in seo_project.user_roles table:", err);
      }
      
      // 3. Kiểm tra từ bảng user_roles trong schema public nếu có
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          return { roleData, roleError: null };
        }
      } catch (err) {
        console.log("Error checking admin role in user_roles table:", err);
      }
      
      // 4. Kiểm tra từ bảng users
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          console.log("Admin role found in users table:", userData);
          return { 
            roleData: { user_id: userId, role: 'admin' }, 
            roleError: null 
          };
        }
      } catch (err) {
        console.log("Error checking admin role in users table:", err);
      }
      
      // 5. Sử dụng RPC function is_admin nếu có
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: userId });
        
        if (!rpcError && isAdmin === true) {
          return { 
            roleData: { user_id: userId, role: 'admin' }, 
            roleError: null 
          };
        }
      } catch (err) {
        console.log("Error checking admin role with RPC:", err);
      }
      
      // Nếu tất cả các phương thức đều thất bại hoặc không tìm thấy vai trò admin
      return { roleData: null, roleError: "Không tìm thấy quyền admin cho người dùng này" };
      
    } catch (error) {
      console.error("Error checking admin role:", error);
      return { 
        roleData: null, 
        roleError: error instanceof Error ? error.message : "Lỗi không xác định khi kiểm tra quyền admin"
      };
    }
  }

  /**
   * Xóa cache cho một user ID cụ thể
   */
  public clearCache(userId: string): void {
    this.adminUserIds.delete(userId);
    this.lastChecks.delete(userId);
  }

  /**
   * Xóa toàn bộ cache
   */
  public clearAllCache(): void {
    this.adminUserIds.clear();
    this.lastChecks.clear();
  }

  /**
   * Thay đổi thời gian cache tùy chỉnh
   * @param durationMs Thời gian cache tính bằng mili giây
   */
  public setCacheDuration(durationMs: number): void {
    if (durationMs > 0) {
      this.cacheDuration = durationMs;
    }
  }
}

// Export instance singleton
export const adminRoleService = AdminRoleService.getInstance();
