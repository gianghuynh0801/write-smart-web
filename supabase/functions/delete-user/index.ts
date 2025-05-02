
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://lxhawtndkubaeljbaylp.supabase.co"
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const standardResponse = (data: any = null, error: string | null = null, status = 200) => {
  return new Response(
    JSON.stringify({ data, error }), 
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  )
}

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
    console.log('[delete-user] Đang xác thực token')
    
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !caller) {
      console.error('[delete-user] Lỗi xác thực:', authError)
      return standardResponse(
        null, 
        `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}`,
        401
      )
    }

    console.log('[delete-user] Xác thực thành công cho user:', caller.id)
    
    // Kiểm tra quyền admin - kiểm tra nhiều nguồn khác nhau để xác định quyền admin
    console.log('[delete-user] Đang kiểm tra quyền admin cho user:', caller.id)
    
    // Kiểm tra từ bảng user_roles (chính thức)
    let isAdmin = false;
    try {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', caller.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!roleError && roleData) {
        console.log('[delete-user] Tìm thấy quyền admin trong user_roles');
        isAdmin = true;
      } else {
        // Kiểm tra từ bảng users (dự phòng)
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', caller.id)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          console.log('[delete-user] Tìm thấy quyền admin trong bảng users');
          isAdmin = true;
        } else {
          // Thử dùng RPC function is_admin nếu có
          try {
            const { data: isAdminRPC, error: rpcError } = await supabaseAdmin.rpc('is_admin', { uid: caller.id });
            if (!rpcError && isAdminRPC === true) {
              console.log('[delete-user] Xác nhận quyền admin qua RPC function');
              isAdmin = true;
            }
          } catch (rpcErr) {
            console.log('[delete-user] RPC is_admin không khả dụng:', rpcErr);
            // Không làm gì nếu RPC không khả dụng
          }
        }
      }
      
      if (!isAdmin) {
        console.error('[delete-user] Người dùng không có quyền admin:', caller.id);
        return standardResponse(null, 'Bạn không có quyền thực hiện thao tác này', 403);
      }
      
      console.log('[delete-user] Xác nhận quyền admin thành công');
    } catch (adminError) {
      console.error('[delete-user] Lỗi khi kiểm tra quyền admin:', adminError);
      return standardResponse(
        null,
        `Lỗi xác thực quyền: ${adminError instanceof Error ? adminError.message : String(adminError)}`,
        500
      );
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
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (getUserError) {
      console.error('[delete-user] Lỗi khi kiểm tra user:', getUserError);
      return standardResponse(
        null,
        `Lỗi khi kiểm tra người dùng: ${getUserError.message}`,
        500
      );
    }

    if (!existingUser) {
      console.error('[delete-user] Không tìm thấy user:', userId);
      return standardResponse(
        null,
        'Không tìm thấy người dùng cần xóa',
        404
      );
    }

    // Xóa các dữ liệu liên quan trước (nếu cần)
    try {
      // Xóa trong bảng user_roles nếu có
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      console.log('[delete-user] Đã xóa dữ liệu liên quan trong bảng user_roles');
    } catch (relatedError) {
      console.log('[delete-user] Không có hoặc không cần xóa dữ liệu liên quan:', relatedError);
      // Tiếp tục xử lý kể cả khi xóa dữ liệu liên quan thất bại
    }
    
    // Xóa user trong auth.users sử dụng admin.deleteUser
    try {
      const { data: authDeleteData, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        userId.toString()
      );
      
      if (authDeleteError) {
        console.error('[delete-user] Lỗi khi xóa user trong auth.users:', authDeleteError);
        // Không return lỗi ở đây, vẫn tiếp tục xóa trong bảng users public
      } else {
        console.log('[delete-user] Đã xóa user trong auth.users thành công');
      }
    } catch (authDeleteErr) {
      console.error('[delete-user] Lỗi khi gọi admin.deleteUser:', authDeleteErr);
      // Tiếp tục xử lý, vẫn xóa trong bảng users public
    }

    // Xóa user trong bảng users public
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('[delete-user] Lỗi khi xóa user trong bảng users:', deleteError);
      return standardResponse(
        null,
        `Lỗi khi xóa người dùng: ${deleteError.message}`,
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
