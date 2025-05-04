
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
      
      // 1. Kiểm tra xem user tồn tại trong bảng users không
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (userError) {
        console.error("[adminUserService] Lỗi khi kiểm tra user:", userError);
        return { success: false, error: `Không thể kiểm tra thông tin user: ${userError.message}` };
      }
      
      if (!userData) {
        return { success: false, error: "User không tồn tại trong hệ thống" };
      }
      
      // 2. Cập nhật vai trò trong bảng users nếu cần
      if (userData.role !== 'admin') {
        const { error: updateRoleError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateRoleError) {
          console.error("[adminUserService] Lỗi khi cập nhật role user:", updateRoleError);
          return { success: false, error: `Không thể cập nhật vai trò: ${updateRoleError.message}` };
        }
        
        console.log("[adminUserService] Đã cập nhật vai trò trong bảng users thành công");
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
        return { success: false, error: `Không thể kiểm tra quyền: ${roleCheckError.message}` };
      }
      
      if (!roleData) {
        // Thêm quyền admin vào bảng user_roles
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
          
        if (insertRoleError) {
          console.error("[adminUserService] Lỗi khi thêm quyền admin:", insertRoleError);
          return { success: false, error: `Không thể thêm quyền admin: ${insertRoleError.message}` };
        }
        
        console.log("[adminUserService] Đã thêm quyền admin vào user_roles thành công");
      } else {
        console.log("[adminUserService] User đã có quyền admin trong bảng user_roles");
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
        
        if (!seoRoleData) {
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
      
      // 5. Kiểm tra và cập nhật bảng seo_project.users
      try {
        const { data: seoUserData, error: seoUserCheckError } = await supabase
          .from('seo_project.users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (seoUserCheckError && !seoUserCheckError.message.includes("does not exist")) {
          console.error("[adminUserService] Lỗi khi kiểm tra seo_project.users:", seoUserCheckError);
          // Không return lỗi, tiếp tục xử lý
        }
        
        if (!seoUserData) {
          // Thêm user vào bảng seo_project.users với role admin
          const { error: insertSeoUserError } = await supabase
            .from('seo_project.users')
            .insert({
              id: userId,
              email: userData.email,
              name: userData.name || "Quản trị viên",
              role: 'admin',
              status: 'active'
            });
            
          if (insertSeoUserError) {
            console.error("[adminUserService] Lỗi khi thêm vào bảng seo_project.users:", insertSeoUserError);
            // Không return lỗi, tiếp tục xử lý
          } else {
            console.log("[adminUserService] Đã thêm vào seo_project.users thành công");
          }
        } else if (seoUserData.role !== 'admin') {
          // Cập nhật role thành admin nếu chưa
          const { error: updateSeoUserError } = await supabase
            .from('seo_project.users')
            .update({ role: 'admin' })
            .eq('id', userId);
            
          if (updateSeoUserError) {
            console.error("[adminUserService] Lỗi khi cập nhật role seo_project.users:", updateSeoUserError);
            // Không return lỗi, tiếp tục xử lý
          } else {
            console.log("[adminUserService] Đã cập nhật role seo_project.users thành công");
          }
        } else {
          console.log("[adminUserService] User đã có vai trò admin trong seo_project.users");
        }
      } catch (error) {
        console.error("[adminUserService] Lỗi khi truy cập bảng seo_project.users:", error);
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
