
import { supabase } from "@/integrations/supabase/client";

// Cache admin role check
interface AdminCheckResult {
  isAdmin: boolean;
  timestamp: number;
  userId: string;
}

class AdminRoleService {
  private static instance: AdminRoleService;
  private adminCheckCache: Record<string, AdminCheckResult> = {};
  private ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 phút
  
  private constructor() {}

  // Singleton pattern
  public static getInstance(): AdminRoleService {
    if (!AdminRoleService.instance) {
      AdminRoleService.instance = new AdminRoleService();
    }
    return AdminRoleService.instance;
  }

  // Kiểm tra quyền admin với cache
  public async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      // Kiểm tra cache
      const cached = this.adminCheckCache[userId];
      const now = Date.now();
      
      if (cached && now - cached.timestamp < this.ADMIN_CACHE_TTL) {
        console.log("[AdminRoleService] Sử dụng kết quả kiểm tra admin từ cache");
        return cached.isAdmin;
      }

      console.log("[AdminRoleService] Kiểm tra quyền admin cho user:", userId);
      
      // Kiểm tra từ nhiều nguồn để đảm bảo kết quả chính xác
      // 1. Thử RPC function
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: userId });
        
        if (!rpcError && isAdmin === true) {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AdminRoleService] Lỗi khi gọi RPC is_admin:", err);
      }
      
      // 2. Kiểm tra từ bảng user_roles
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AdminRoleService] Lỗi khi kiểm tra bảng user_roles:", err);
      }
      
      // 3. Kiểm tra từ trường role trong bảng users
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AdminRoleService] Lỗi khi kiểm tra bảng users:", err);
      }
      
      // Cập nhật cache với kết quả không có quyền admin
      this.updateAdminCache(userId, false);
      return false;
    } catch (error) {
      console.error("[AdminRoleService] Lỗi không xác định khi kiểm tra quyền admin:", error);
      return false;
    }
  }

  // Cập nhật cache admin check
  private updateAdminCache(userId: string, isAdmin: boolean): void {
    this.adminCheckCache[userId] = {
      userId,
      isAdmin,
      timestamp: Date.now()
    };
  }
}

// Xuất instance singleton
export const adminRoleService = AdminRoleService.getInstance();
