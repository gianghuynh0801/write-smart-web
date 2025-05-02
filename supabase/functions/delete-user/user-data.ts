
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Kiểm tra người dùng tồn tại
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param userId ID người dùng cần kiểm tra
 * @returns Thông tin người dùng nếu tồn tại, null nếu không tồn tại
 */
export const checkUserExists = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  const { data: existingUser, error: getUserError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (getUserError) {
    console.error('[user-data] Lỗi khi kiểm tra user:', getUserError);
    throw getUserError;
  }

  return existingUser;
};

/**
 * Xóa dữ liệu liên quan của người dùng trong các bảng
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param userId ID người dùng cần xóa
 */
export const deleteRelatedData = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  // QUAN TRỌNG: Xóa dữ liệu liên quan trong user_subscriptions trước
  try {
    console.log('[user-data] Đang xóa dữ liệu trong bảng user_subscriptions');
    
    const { error: deleteSubscriptionsError } = await supabaseAdmin
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteSubscriptionsError) {
      console.error('[user-data] Lỗi khi xóa dữ liệu từ bảng user_subscriptions:', deleteSubscriptionsError);
      throw deleteSubscriptionsError;
    }
    console.log('[user-data] Đã xóa thành công dữ liệu trong bảng user_subscriptions');
  } catch (subError) {
    console.error('[user-data] Lỗi không mong đợi khi xóa dữ liệu đăng ký:', subError);
    throw subError;
  }

  // Xóa dữ liệu liên quan khác nếu có
  try {
    // Xóa trong bảng user_roles nếu có
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    console.log('[user-data] Đã xóa dữ liệu liên quan trong bảng user_roles');
    
    // Xóa trong bảng payment_history nếu có
    await supabaseAdmin
      .from('payment_history')
      .delete()
      .eq('user_id', userId);
    
    console.log('[user-data] Đã xóa dữ liệu liên quan trong bảng payment_history');
    
    // Xóa trong bảng articles nếu có
    await supabaseAdmin
      .from('articles')
      .delete()
      .eq('user_id', userId);
    
    console.log('[user-data] Đã xóa dữ liệu liên quan trong bảng articles');
    
    // Xóa trong bảng verification_tokens nếu có
    await supabaseAdmin
      .from('verification_tokens')
      .delete()
      .eq('user_id', userId);
    
    console.log('[user-data] Đã xóa dữ liệu liên quan trong bảng verification_tokens');
    
  } catch (relatedError) {
    console.log('[user-data] Lỗi khi xóa một số dữ liệu liên quan (không ảnh hưởng đến quá trình):', relatedError);
    // Tiếp tục xử lý kể cả khi xóa dữ liệu liên quan thất bại
  }
};

/**
 * Xóa người dùng khỏi hệ thống xác thực
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param userId ID người dùng cần xóa
 * @returns true nếu xóa thành công, false nếu có lỗi
 */
export const deleteAuthUser = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  try {
    const { data: authDeleteData, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId.toString()
    );
    
    if (authDeleteError) {
      console.error('[user-data] Lỗi khi xóa user trong auth.users:', authDeleteError);
      return false;
    } else {
      console.log('[user-data] Đã xóa user trong auth.users thành công');
      return true;
    }
  } catch (authDeleteErr) {
    console.error('[user-data] Lỗi khi gọi admin.deleteUser:', authDeleteErr);
    return false;
  }
};

/**
 * Xóa người dùng khỏi bảng public users
 * @param supabaseAdmin Client Supabase với quyền admin
 * @param userId ID người dùng cần xóa
 */
export const deletePublicUser = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  const { error: deleteError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    console.error('[user-data] Lỗi khi xóa user trong bảng users:', deleteError);
    throw deleteError;
  }

  console.log('[user-data] Xóa user thành công trong bảng public');
};
