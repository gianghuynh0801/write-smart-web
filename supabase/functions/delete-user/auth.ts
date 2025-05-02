
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Xác thực người dùng từ token
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param token Token xác thực
 * @returns Thông tin người dùng nếu xác thực thành công, null nếu không thành công
 */
export const authenticateUser = async (supabaseAdmin: ReturnType<typeof createClient>, token: string) => {
  console.log('[auth] Đang xác thực token');
  
  const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !caller) {
    console.error('[auth] Lỗi xác thực:', authError);
    return { caller: null, error: authError };
  }

  console.log('[auth] Xác thực thành công cho user:', caller.id);
  return { caller, error: null };
};

/**
 * Kiểm tra quyền admin của người dùng
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param userId ID người dùng cần kiểm tra
 * @returns true nếu người dùng có quyền admin, false nếu không
 */
export const verifyAdminRole = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  console.log('[auth] Đang kiểm tra quyền admin cho user:', userId);
  
  try {
    // Kiểm tra từ bảng user_roles (chính thức)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!roleError && roleData) {
      console.log('[auth] Tìm thấy quyền admin trong user_roles');
      return true;
    } 
    
    // Kiểm tra từ bảng users (dự phòng)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (!userError && userData?.role === 'admin') {
      console.log('[auth] Tìm thấy quyền admin trong bảng users');
      return true;
    }
    
    // Thử dùng RPC function is_admin nếu có
    try {
      const { data: isAdminRPC, error: rpcError } = await supabaseAdmin.rpc('is_admin', { uid: userId });
      if (!rpcError && isAdminRPC === true) {
        console.log('[auth] Xác nhận quyền admin qua RPC function');
        return true;
      }
    } catch (rpcErr) {
      console.log('[auth] RPC is_admin không khả dụng:', rpcErr);
    }
    
    console.error('[auth] Người dùng không có quyền admin:', userId);
    return false;
    
  } catch (adminError) {
    console.error('[auth] Lỗi khi kiểm tra quyền admin:', adminError);
    throw adminError;
  }
};
