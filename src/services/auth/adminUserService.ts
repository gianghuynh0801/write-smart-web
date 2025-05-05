
import { supabase } from "@/integrations/supabase/client";
import { adminRoleService } from "@/services/auth/adminRoleService";

/**
 * Dịch vụ quản lý và cập nhật tài khoản quản trị viên
 */
export const adminUserService = {
  /**
   * Thiết lập một user hiện có làm quản trị viên chính
   * @param userId ID của user cần thiết lập làm quản trị viên
   * @returns Kết quả thiết lập quyền admin
   */
  async setAsPrimaryAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: "Không có ID người dùng" };
    
    try {
      console.log("[adminUserService] Thiết lập user ID:", userId, "làm quản trị viên chính");
      
      // 1. Kiểm tra xem user tồn tại trong bảng seo_project.users không
      const { data: userData, error: userError } = await supabase
        .from('seo_project.users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (userError) {
        console.error("[adminUserService] Lỗi khi kiểm tra seo_project.users:", userError);
        
        // Nếu không tìm thấy trong bảng seo_project.users, kiểm tra bảng auth.users
        try {
          // Kiểm tra trong auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
          
          if (authError || !authUser?.user) {
            console.error("[adminUserService] Lỗi khi kiểm tra auth.users:", authError);
            return { success: false, error: `Không thể kiểm tra thông tin user: ${authError?.message || userError.message}` };
          }
          
          // User tồn tại trong auth.users, tạo mới trong seo_project.users
          const { error: createError } = await supabase
            .from('seo_project.users')
            .insert({
              id: userId,
              email: authUser.user.email || '',
              name: authUser.user.user_metadata?.name || "Quản trị viên",
              role: 'admin',
              status: 'active'
            });
            
          if (createError) {
            console.error("[adminUserService] Lỗi khi tạo mới trong seo_project.users:", createError);
            return { success: false, error: `Không thể tạo user mới: ${createError.message}` };
          }
          
          console.log("[adminUserService] Đã tạo mới user trong seo_project.users");
        } catch (error) {
          console.error("[adminUserService] Lỗi khi truy cập auth.users:", error);
          return { success: false, error: `Không thể kiểm tra thông tin user: ${error instanceof Error ? error.message : String(error)}` };
        }
      } else if (!userData) {
        // User không tồn tại trong cả hai bảng
        return { success: false, error: "User không tồn tại trong hệ thống" };
      } else if (userData.role === 'admin') {
        console.log("[adminUserService] User đã là admin trong seo_project.users");
      } else {
        // 2. Cập nhật vai trò trong bảng seo_project.users
        const { error: updateRoleError } = await supabase
          .from('seo_project.users')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateRoleError) {
          console.error("[adminUserService] Lỗi khi cập nhật role user:", updateRoleError);
          return { success: false, error: `Không thể cập nhật vai trò: ${updateRoleError.message}` };
        }
        
        console.log("[adminUserService] Đã cập nhật vai trò trong bảng seo_project.users thành công");
      }
      
      // 3. Kiểm tra và thêm vào bảng user_roles
      const { data: roleData, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (roleCheckError && !roleCheckError.message.includes("does not exist")) {
        console.error("[adminUserService] Lỗi khi kiểm tra quyền:", roleCheckError);
        // Không return lỗi, tiếp tục thử thêm
      }
      
      if (!roleData && !roleCheckError?.message.includes("does not exist")) {
        // Thêm quyền admin vào bảng user_roles nếu bảng này tồn tại
        try {
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });
            
          if (insertRoleError) {
            console.error("[adminUserService] Lỗi khi thêm quyền admin:", insertRoleError);
            // Không return lỗi, tiếp tục xử lý
          } else {
            console.log("[adminUserService] Đã thêm quyền admin vào user_roles thành công");
          }
        } catch (error) {
          console.error("[adminUserService] Lỗi khi thêm vào user_roles:", error);
          // Không return lỗi, tiếp tục xử lý
        }
      } else {
        console.log("[adminUserService] Không cần thêm quyền vào user_roles");
      }
      
      // 4. Kiểm tra và thêm vào bảng seo_project.user_roles
      try {
        const { data: seoRoleData, error: seoRoleCheckError } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
          
        if (seoRoleCheckError && !seoRoleCheckError.message.includes("does not exist")) {
          console.error("[adminUserService] Lỗi khi kiểm tra quyền seo_project:", seoRoleCheckError);
          // Không return lỗi, tiếp tục thử thêm
        }
        
        if (!seoRoleData && !seoRoleCheckError?.message.includes("does not exist")) {
          // Thêm quyền admin vào bảng seo_project.user_roles
          const { error: insertSeoRoleError } = await supabase
            .from('seo_project.user_roles')
            .insert({ user_id: userId, role: 'admin' });
            
          if (insertSeoRoleError) {
            console.error("[adminUserService] Lỗi khi thêm quyền admin vào seo_project:", insertSeoRoleError);
            // Không return lỗi, tiếp tục xử lý
          } else {
            console.log("[adminUserService] Đã thêm quyền admin vào seo_project.user_roles thành công");
          }
        } else {
          console.log("[adminUserService] User đã có quyền admin trong bảng seo_project.user_roles");
        }
      } catch (error) {
        console.error("[adminUserService] Lỗi khi truy cập bảng seo_project.user_roles:", error);
        // Không return lỗi, tiếp tục xử lý
      }
      
      // Xóa cache để đảm bảo lần kiểm tra tiếp theo sẽ lấy dữ liệu mới từ database
      adminRoleService.clearCache(userId);
      
      return { success: true };
    } catch (error: any) {
      console.error("[adminUserService] Lỗi không mong đợi:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Lỗi không xác định khi thiết lập quyền admin"
      };
    }
  }
};
