
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
  // Xử lý CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[add-admin-user] Xử lý yêu cầu tạo tài khoản quản trị viên");
    
    // Lấy dữ liệu từ request
    const { email, password, name = "Quản trị viên" } = await req.json();
    
    if (!email || !password) {
      return standardResponse(null, "Thiếu email hoặc mật khẩu", 400);
    }
    
    // 1. Tạo người dùng mới
    console.log("[add-admin-user] Đang tạo người dùng mới:", email);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        is_admin: true
      },
      email_confirm: true // Tự động xác nhận email để có thể đăng nhập ngay
    });
    
    if (userError || !userData.user) {
      console.error("[add-admin-user] Lỗi khi tạo tài khoản:", userError);
      return standardResponse(null, `Lỗi khi tạo tài khoản: ${userError?.message || "Lỗi không xác định"}`, 500);
    }
    
    const userId = userData.user.id;
    console.log("[add-admin-user] Tạo tài khoản thành công, ID:", userId);
    
    // 2. Thêm vai trò admin vào bảng user_roles trong schema seo_project
    console.log("[add-admin-user] Đang thêm vai trò admin trong schema seo_project");
    try {
      const { error: roleError } = await supabaseAdmin
        .from('seo_project.user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("[add-admin-user] Lỗi khi thêm vai trò admin (seo_project):", roleError);
        return standardResponse(null, `Lỗi khi thêm vai trò admin: ${roleError.message}`, 500);
      } else {
        console.log("[add-admin-user] Thêm vai trò admin thành công (seo_project)");
      }
    } catch (roleError) {
      console.error("[add-admin-user] Lỗi khi thêm vai trò admin (seo_project):", roleError);
      // Không dừng lại, thử tiếp phương thức khác
    }
    
    // 3. Thử thêm vai trò admin vào bảng user_roles trong schema public (phòng hờ)
    console.log("[add-admin-user] Đang thêm vai trò admin trong schema public");
    try {
      const { error: publicRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });
      
      if (publicRoleError) {
        console.error("[add-admin-user] Lỗi khi thêm vai trò admin (public):", publicRoleError);
      } else {
        console.log("[add-admin-user] Thêm vai trò admin thành công (public)");
      }
    } catch (publicRoleError) {
      console.error("[add-admin-user] Lỗi khi thêm vai trò admin (public):", publicRoleError);
      // Không dừng lại, thử tiếp phương thức khác
    }
    
    // 4. Thêm thông tin người dùng vào bảng users với role admin
    console.log("[add-admin-user] Đang thêm người dùng vào bảng users");
    try {
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          name: name,
          role: 'admin',
          status: 'active',
          credits: 100,
          subscription: 'Premium'
        });
      
      if (usersError) {
        console.error("[add-admin-user] Lỗi chi tiết khi thêm vào bảng users:", usersError);
        return standardResponse(null, `Lỗi khi thêm vào bảng users: ${usersError.message}`, 500);
      } else {
        console.log("[add-admin-user] Thêm vào bảng users thành công");
      }
    } catch (usersError: any) {
      console.error("[add-admin-user] Lỗi chi tiết khi thêm vào bảng users:", usersError);
      return standardResponse(null, `Lỗi khi thêm vào bảng users: ${usersError.message || String(usersError)}`, 500);
    }
    
    // 5. Thêm thông tin người dùng vào bảng seo_project.users với role admin
    console.log("[add-admin-user] Đang thêm người dùng vào bảng seo_project.users");
    try {
      const { error: seoUsersError } = await supabaseAdmin
        .from('seo_project.users')
        .insert({
          id: userId,
          email: email,
          name: name,
          role: 'admin',
          status: 'active'
        });
      
      if (seoUsersError) {
        console.error("[add-admin-user] Lỗi chi tiết khi thêm vào bảng seo_project.users:", seoUsersError);
        return standardResponse(null, `Lỗi khi thêm vào bảng seo_project.users: ${seoUsersError.message}`, 500);
      } else {
        console.log("[add-admin-user] Thêm vào bảng seo_project.users thành công");
      }
    } catch (seoUsersError: any) {
      console.error("[add-admin-user] Lỗi chi tiết khi thêm vào bảng seo_project.users:", seoUsersError);
      return standardResponse(null, `Lỗi khi thêm vào bảng seo_project.users: ${seoUsersError.message || String(seoUsersError)}`, 500);
    }
    
    // Trả về kết quả thành công
    return standardResponse({
      user: {
        id: userId,
        email: email,
        name: name,
      },
      message: "Tạo tài khoản quản trị viên thành công"
    });
    
  } catch (error) {
    console.error("[add-admin-user] Lỗi không mong đợi:", error);
    return standardResponse(
      null,
      `Lỗi khi tạo tài khoản admin: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
});
