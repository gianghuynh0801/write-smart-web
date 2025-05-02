
import { supabase } from "@/integrations/supabase/client";
import { adminRoleService } from "@/services/auth/adminRoleService";

export const defaultAdmin = {
  username: "admin",
  password: "admin@1238",
  email: "admin@example.com"
};

/**
 * Kiểm tra quyền admin đầy đủ cho một người dùng
 * Hàm này sử dụng AdminRoleService để tận dụng cơ chế cache và fallback
 * @param userId ID người dùng cần kiểm tra
 * @returns Thông tin về quyền admin và lỗi nếu có
 */
export const checkAdminRole = async (userId: string) => {
  if (!userId) {
    return {
      roleData: null,
      roleError: "Không có ID người dùng"
    };
  }
  
  return await adminRoleService.getAdminRoleData(userId);
};

/**
 * Thêm quyền admin cho một người dùng
 * @param userId ID người dùng cần thêm quyền
 * @returns Kết quả thêm quyền
 */
export const addAdminRole = async (userId: string) => {
  if (!userId) return { success: false, error: "Không có ID người dùng" };
  
  try {
    // Thêm vào bảng seo_project.user_roles
    const { error: projectRoleError } = await supabase
      .from('seo_project.user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
    
    if (projectRoleError) {
      console.error("Lỗi khi thêm quyền admin vào seo_project.user_roles:", projectRoleError);
    }
    
    // Cập nhật trường role trong bảng seo_project.users nếu có
    const { error: projectUserError } = await supabase
      .from('seo_project.users')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (projectUserError) {
      console.error("Lỗi khi cập nhật role trong seo_project.users:", projectUserError);
    }
    
    // Xóa cache để đảm bảo lần kiểm tra tiếp theo sẽ lấy dữ liệu mới từ database
    adminRoleService.clearCache(userId);
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi không mong đợi khi thêm quyền admin:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Lỗi không xác định khi thêm quyền admin"
    };
  }
};

/**
 * Xóa quyền admin của một người dùng
 * @param userId ID người dùng cần xóa quyền
 * @returns Kết quả xóa quyền
 */
export const removeAdminRole = async (userId: string) => {
  if (!userId) return { success: false, error: "Không có ID người dùng" };
  
  try {
    // Xóa từ bảng seo_project.user_roles
    const { error: projectRoleError } = await supabase
      .from('seo_project.user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (projectRoleError) {
      console.error("Lỗi khi xóa quyền admin từ seo_project.user_roles:", projectRoleError);
    }
    
    // Cập nhật trường role trong bảng seo_project.users nếu có
    const { error: projectUserError } = await supabase
      .from('seo_project.users')
      .update({ role: 'user' })
      .eq('id', userId);
    
    if (projectUserError) {
      console.error("Lỗi khi cập nhật role trong seo_project.users:", projectUserError);
    }
    
    // Xóa cache để đảm bảo lần kiểm tra tiếp theo sẽ lấy dữ liệu mới từ database
    adminRoleService.clearCache(userId);
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi không mong đợi khi xóa quyền admin:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Lỗi không xác định khi xóa quyền admin"
    };
  }
};
