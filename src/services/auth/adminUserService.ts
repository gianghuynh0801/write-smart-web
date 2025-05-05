
import { supabase } from "@/integrations/supabase/client";

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
      
      // 1. Kiểm tra xem user tồn tại trong bảng auth.users không
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (authError || !authUser?.user) {
          console.error("[adminUserService] Lỗi khi kiểm tra auth.users:", authError);
          return { success: false, error: `Không thể xác minh ID người dùng: ${authError?.message || "Lỗi không xác định"}` };
        }
      } catch (error) {
        console.warn("[adminUserService] Không thể truy cập auth.users, có thể do quyền hạn bị giới hạn");
        // Tiếp tục mà không cần kiểm tra auth.users
      }
      
      // 2. Kiểm tra xem user tồn tại trong bảng seo_project.users không
      const { data: userData, error: userError } = await supabase
        .from('seo_project.users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (userError) {
        console.error("[adminUserService] Lỗi khi kiểm tra seo_project.users:", userError);
        return { success: false, error: `Không thể kiểm tra thông tin user: ${userError.message}` };
      }
      
      if (!userData) {
        // Người dùng không tồn tại trong bảng seo_project.users, lấy thông tin từ auth.users và tạo mới
        try {
          // Thử lấy thông tin email từ bảng auth.users
          const { data: authData } = await supabase.auth.admin.getUserById(userId);
          const email = authData?.user?.email || "admin@example.com";
          
          // Tạo mới người dùng trong seo_project.users
          const { error: createError } = await supabase
            .from('seo_project.users')
            .insert({
              id: userId,
              email: email,
              name: "Quản trị viên",
              role: 'admin'
            });
            
          if (createError) {
            console.error("[adminUserService] Lỗi khi tạo mới trong seo_project.users:", createError);
            return { success: false, error: `Không thể tạo user mới: ${createError.message}` };
          }
          
          console.log("[adminUserService] Đã tạo mới user trong seo_project.users");
        } catch (error: any) {
          console.error("[adminUserService] Lỗi khi tạo mới user:", error);
          return { success: false, error: `Không thể tạo user mới: ${error.message || "Lỗi không xác định"}` };
        }
      } else if (userData.role === 'admin') {
        console.log("[adminUserService] User đã là admin trong seo_project.users");
      } else {
        // 3. Cập nhật vai trò trong bảng seo_project.users
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
      
      // 4. Kiểm tra và thêm vào bảng seo_project.user_roles
      try {
        const { data: seoRoleData, error: seoRoleCheckError } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
          
        if (seoRoleCheckError) {
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
