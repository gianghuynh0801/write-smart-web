
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

// Hàm kiểm tra quyền admin
const checkUserIsAdmin = async (userId: string) => {
  console.log("[checkUserIsAdmin] Đang kiểm tra quyền admin cho user:", userId);

  try {
    // Kiểm tra từ bảng user_roles (chính thức)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error("[checkUserIsAdmin] Lỗi khi kiểm tra user_roles:", roleError);
      return false;
    }

    if (roleData) {
      console.log("[checkUserIsAdmin] Tìm thấy quyền admin trong user_roles");
      return true;
    }

    // Kiểm tra từ bảng users (backup)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error("[checkUserIsAdmin] Lỗi khi kiểm tra users:", userError);
      return false;
    }

    return userData?.role === 'admin';
  } catch (error) {
    console.error("[checkUserIsAdmin] Lỗi không xác định:", error);
    return false;
  }
};

// Hàm lấy danh sách người dùng với phân trang và tìm kiếm - đã tối ưu để trả về ít dữ liệu hơn
const getUsers = async (page: number, pageSize: number, status: string, searchTerm: string, minimal = false) => {
  try {
    console.log("Đang lấy danh sách người dùng với thông số:", { page, pageSize, status, searchTerm, minimal });
    
    // Chọn các trường cần thiết dựa vào cờ minimal
    const selectColumns = minimal 
      ? 'id, name, email, credits, status, role, created_at, email_verified, subscription' 
      : '*';
    
    let query = supabaseAdmin.from('users').select(selectColumns, { count: 'exact' });

    // Áp dụng bộ lọc trạng thái
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Áp dụng tìm kiếm
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    // Áp dụng phân trang
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Thực hiện truy vấn
    const { data: users, count, error } = await query;

    if (error) {
      console.error("Lỗi khi truy vấn users:", error);
      throw error;
    }

    // Biến đổi dữ liệu nếu cần
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      credits: user.credits ?? 0,
      subscription: user.subscription ?? "Không có",
      status: user.status === "inactive" ? "inactive" : "active",
      registeredAt: user.created_at ? new Date(user.created_at).toISOString().split("T")[0] : "",
      avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
      role: user.role === "admin" || user.role === "editor" ? user.role : "user",
      email_verified: !!user.email_verified
    }));

    return { users: transformedUsers, total: count || 0 };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

Deno.serve(async (req) => {
  try {
    // Xử lý CORS preflight request
    if (req.method === 'OPTIONS') {
      console.log("Xử lý CORS preflight request");
      return new Response(null, { headers: corsHeaders });
    }

    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Thiếu Authorization header");
      return standardResponse(null, 'Thiếu thông tin xác thực', 401);
    }

    // Lấy token và xác thực người dùng
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Lỗi xác thực:", authError);
      return standardResponse(null, 'Xác thực không thành công', 401);
    }

    console.log("Đã xác thực người dùng:", user.id);

    // Kiểm tra quyền admin
    const isAdmin = await checkUserIsAdmin(user.id);
    if (!isAdmin) {
      console.error("Người dùng không có quyền admin:", user.id);
      return standardResponse(null, 'Bạn không có quyền thực hiện thao tác này', 403);
    }

    console.log("Xác nhận quyền admin thành công");

    // Lấy tham số từ request
    const { searchTerm = '', status = 'all', page = 1, pageSize = 5, minimal = false } = await req.json();
    
    // Lấy danh sách người dùng với cờ minimal để kiểm soát dữ liệu trả về
    const { users, total } = await getUsers(page, pageSize, status, searchTerm, minimal);
    
    console.log(`Đã tìm thấy ${users.length} người dùng, tổng số: ${total}`);

    return standardResponse({ users, total });
  } catch (error) {
    console.error("Lỗi không mong đợi:", error);
    return standardResponse(
      null,
      error instanceof Error ? error.message : 'Lỗi không xác định',
      500
    );
  }
});
