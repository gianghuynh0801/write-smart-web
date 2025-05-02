
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { standardResponse } from './utils.ts'
import { authenticateUser, verifyAdminRole } from './auth.ts'
import { 
  checkUserExists, 
  deleteRelatedData, 
  deleteAuthUser, 
  deletePublicUser 
} from './user-data.ts'

const supabaseUrl = "https://lxhawtndkubaeljbaylp.supabase.co"
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[delete-user] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[delete-user] Thiếu Authorization header')
      return standardResponse(null, 'Thiếu thông tin xác thực', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { caller, error: authError } = await authenticateUser(supabaseAdmin, token)
    
    if (authError || !caller) {
      return standardResponse(
        null, 
        `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}`,
        401
      )
    }

    // Kiểm tra quyền admin
    try {
      const isAdmin = await verifyAdminRole(supabaseAdmin, caller.id)
      if (!isAdmin) {
        console.error('[delete-user] Người dùng không có quyền admin:', caller.id)
        return standardResponse(null, 'Bạn không có quyền thực hiện thao tác này', 403)
      }
      
      console.log('[delete-user] Xác nhận quyền admin thành công')
    } catch (adminError) {
      console.error('[delete-user] Lỗi khi kiểm tra quyền admin:', adminError)
      return standardResponse(
        null,
        `Lỗi xác thực quyền: ${adminError instanceof Error ? adminError.message : String(adminError)}`,
        500
      )
    }

    // Lấy dữ liệu từ request
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('[delete-user] Lỗi khi parse dữ liệu request:', parseError);
      return standardResponse(null, 'Dữ liệu request không hợp lệ', 400);
    }
    
    const { userId } = requestData;
    
    if (!userId) {
      console.error('[delete-user] Thiếu ID người dùng:', requestData);
      return standardResponse(null, 'Thiếu ID người dùng cần xóa', 400);
    }

    console.log("[delete-user] Đang xóa user:", userId);

    // Kiểm tra user tồn tại
    try {
      const existingUser = await checkUserExists(supabaseAdmin, userId);
      if (!existingUser) {
        console.error('[delete-user] Không tìm thấy user:', userId);
        return standardResponse(null, 'Không tìm thấy người dùng cần xóa', 404);
      }
    } catch (checkError) {
      return standardResponse(
        null,
        `Lỗi khi kiểm tra người dùng: ${checkError instanceof Error ? checkError.message : String(checkError)}`,
        500
      );
    }

    // Xóa dữ liệu liên quan
    try {
      await deleteRelatedData(supabaseAdmin, userId);
    } catch (relatedError) {
      return standardResponse(
        null,
        `Lỗi khi xóa dữ liệu liên quan: ${relatedError instanceof Error ? relatedError.message : String(relatedError)}`,
        500
      );
    }
    
    // Xóa user trong auth.users
    await deleteAuthUser(supabaseAdmin, userId);
    // Chúng ta không return lỗi ở đây vì vẫn muốn tiếp tục xóa trong bảng users public

    // Xóa user trong bảng users public
    try {
      await deletePublicUser(supabaseAdmin, userId);
    } catch (publicUserError) {
      return standardResponse(
        null,
        `Lỗi khi xóa người dùng: ${publicUserError instanceof Error ? publicUserError.message : String(publicUserError)}`,
        500
      );
    }

    // Trả về kết quả thành công
    console.log('[delete-user] Xóa user thành công');
    return standardResponse(
      { success: true, message: "Đã xóa người dùng thành công" },
      null,
      200
    );

  } catch (error) {
    console.error('[delete-user] Lỗi không mong đợi:', error);
    return standardResponse(
      null,
      error instanceof Error ? error.message : String(error),
      500
    );
  }
})
