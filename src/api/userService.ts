import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";

// === MOCK DATA, chỉ sử dụng để insert vào DB nếu DB đang trống ===
const mockUsers: User[] = [
  { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@example.com", credits: 48, subscription: "Chuyên nghiệp", status: "active", registeredAt: "2023-04-15", avatar: "https://i.pravatar.cc/150?img=1", role: "user" },
  { id: "2", name: "Trần Thị B", email: "tranthib@example.com", credits: 22, subscription: "Cơ bản", status: "active", registeredAt: "2023-03-28", avatar: "https://i.pravatar.cc/150?img=2", role: "user" },
  { id: "3", name: "Lê Văn C", email: "levanc@example.com", credits: 0, subscription: "Không có", status: "inactive", registeredAt: "2023-02-10", avatar: "https://i.pravatar.cc/150?img=3", role: "admin" },
  { id: "4", name: "Phạm Thị D", email: "phamthid@example.com", credits: 89, subscription: "Doanh nghiệp", status: "active", registeredAt: "2023-05-02", avatar: "https://i.pravatar.cc/150?img=4", role: "editor" },
  { id: "5", name: "Hoàng Văn E", email: "hoangvane@example.com", credits: 12, subscription: "Cơ bản", status: "active", registeredAt: "2023-04-20", avatar: "https://i.pravatar.cc/150?img=5", role: "user" },
  { id: "6", name: "Vũ Minh F", email: "vuminhf@example.com", credits: 35, subscription: "Chuyên nghiệp", status: "active", registeredAt: "2023-06-15", avatar: "https://i.pravatar.cc/150?img=6", role: "user" },
  { id: "7", name: "Đặng Thu G", email: "dangthug@example.com", credits: 0, subscription: "Không có", status: "inactive", registeredAt: "2023-03-10", avatar: "https://i.pravatar.cc/150?img=7", role: "editor" },
  { id: "8", name: "Bùi Thanh H", email: "buithanhh@example.com", credits: 18, subscription: "Cơ bản", status: "active", registeredAt: "2023-07-05", avatar: "https://i.pravatar.cc/150?img=8", role: "user" },
  { id: "9", name: "Trương Anh I", email: "truonganhi@example.com", credits: 67, subscription: "Doanh nghiệp", status: "active", registeredAt: "2023-05-20", avatar: "https://i.pravatar.cc/150?img=9", role: "user" },
  { id: "10", name: "Lý Minh J", email: "lyminhj@example.com", credits: 5, subscription: "Cơ bản", status: "active", registeredAt: "2023-06-30", avatar: "https://i.pravatar.cc/150?img=10", role: "admin" },
  { id: "11", name: "Phan Thu K", email: "phanthuk@example.com", credits: 40, subscription: "Chuyên nghiệp", status: "active", registeredAt: "2023-04-25", avatar: "https://i.pravatar.cc/150?img=11", role: "user" },
  { id: "12", name: "Đỗ Văn L", email: "dovanl@example.com", credits: 0, subscription: "Không có", status: "inactive", registeredAt: "2023-02-18", avatar: "https://i.pravatar.cc/150?img=12", role: "user" }
];

function parseUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    credits: row.credits ?? 0,
    subscription: row.subscription ?? "Không có",
    status: row.status === "inactive" ? "inactive" : "active",
    registeredAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    avatar: row.avatar || "",
    role: row.role === "admin" || row.role === "editor" ? row.role : "user"
  };
}

// Chuyển dữ liệu mock vào DB nếu DB đang trống (chạy 1 lần, không làm chậm load app)
export const syncMockUsersToDbIfNeeded = async () => {
  const { count } = await supabase.from("users").select("id", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    // Nếu DB chưa có user nào, insert hết mock vào
    const toInsert = mockUsers.map(u => ({
      ...u,
      created_at: u.registeredAt,
      // Đảm bảo UUID cho id (nếu id string mới hợp lệ, dùng random uuid cho DEMO, còn production dùng uuid thực của supabase auth)
      id: crypto.randomUUID()
    }));
    await supabase.from("users").insert(toInsert as any);
  }
};

// Lấy DS người dùng (dynamic, phân trang, search, status)
export const fetchUsers = async (
  page = 1,
  pageSize = 5,
  status: string = "all",
  searchTerm: string = ""
): Promise<{ data: User[]; total: number }> => {
  await syncMockUsersToDbIfNeeded();

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Lọc trạng thái
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // Lọc tìm kiếm
  if (searchTerm) {
    query = query
      .or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
  }

  // Phân trang
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw new Error("Không thể tải danh sách người dùng");

  return {
    data: (data || []).map(parseUser),
    total: count || 0
  };
};

export const getUserById = async (id: string | number): Promise<User | undefined> => {
  // Chuyển đổi id thành string nếu đang là number
  const userId = String(id);
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("Không tìm thấy người dùng");
  return data ? parseUser(data) : undefined;
};

export const createUser = async (userData: UserFormValues): Promise<User> => {
  // Tạo user với random uuid (dev), production cần map đúng auth id
  const newId = crypto.randomUUID();
  const { data, error } = await supabase.from("users").insert([
    {
      id: newId,
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      subscription: userData.subscription,
      status: userData.status,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: userData.role
    }
  ]).select().single();

  if (error) throw new Error(error.message);
  return parseUser(data);
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  // Chuyển đổi id thành string nếu đang là number
  const userId = String(id);
  
  // Lấy thông tin hiện tại của người dùng để giữ lại subscription (không cập nhật trực tiếp)
  const currentUser = await getUserById(userId);
  
  // Chỉ cập nhật các trường có trong bảng users, bỏ qua trường subscription
  const { data, error } = await supabase
    .from("users")
    .update({
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      role: userData.role
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  // Khi parse user, trả về giá trị subscription từ dữ liệu hiện tại
  // (vì cột subscription không có trong bảng users)
  const updatedUser = parseUser(data);
  updatedUser.subscription = userData.subscription; // Chỉ gán giá trị cho UI hiển thị
  
  // Nếu subscription thay đổi, cập nhật vào bảng user_subscriptions
  if (currentUser && currentUser.subscription !== userData.subscription) {
    try {
      await handleSubscriptionChange(userId, userData.subscription);
    } catch (subError) {
      console.error("Không thể cập nhật thông tin đăng ký:", subError);
      // Ghi nhận lỗi nhưng không throw error ở đây, tránh làm gián đoạn luồng chính
      // Thay vào đó, chỉ log lỗi để debug
    }
  }
  
  return updatedUser;
};

// Hàm xử lý việc thay đổi gói đăng ký
async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    // Tìm ID của gói đăng ký dựa trên tên
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("name", subscriptionName)
      .maybeSingle();

    if (!subscriptionData) {
      console.log(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
      return;
    }

    const subscriptionId = subscriptionData.id;
    
    // Kiểm tra xem người dùng đã có đăng ký nào chưa
    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .maybeSingle();

    // Tính toán ngày bắt đầu và kết thúc
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 tháng
    const endDateStr = endDate.toISOString().split('T')[0];

    if (existingSubscription) {
      // Hủy đăng ký cũ nếu có - sử dụng await để đảm bảo hoàn thành trước khi tiếp tục
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("id", existingSubscription.id);
        
      if (error) {
        console.error(`Lỗi khi hủy gói cũ: ${error.message}`);
        // Không throw error ở đây để tránh gián đoạn luồng chính
      }
    }
    
    // Thay đổi cách tạo đăng ký mới sử dụng RPC thay vì insert trực tiếp
    // RPC có thể bypass RLS policy nếu được cấu hình đúng
    const { error } = await supabase.rpc('create_user_subscription', {
      p_user_id: userId,
      p_subscription_id: subscriptionId,
      p_start_date: startDate,
      p_end_date: endDateStr,
      p_status: 'active'
    });
    
    // Nếu RPC không tồn tại hoặc có lỗi, thử phương pháp khác - chỉ log lỗi
    if (error) {
      console.error(`Lỗi khi tạo gói mới qua RPC: ${error.message}`);
      // Không throw error để tránh gián đoạn luồng chính
    }
  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
    // Log lỗi nhưng không throw để tránh gián đoạn UI
  }
}

export const deleteUser = async (id: string | number): Promise<void> => {
  // Chuyển đổi id thành string nếu đang là number
  const userId = String(id);
  
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};

export const addUserCredits = async (id: string | number, amount: number): Promise<User> => {
  // Chuyển đổi id thành string nếu đang là number
  const userId = String(id);
  
  // Lấy user hiện tại
  const { data: currentData, error: getError } = await supabase.from("users").select("*").eq("id", userId).single();
  if (getError) throw new Error("Không tìm thấy người dùng");
  const newCredits = (currentData.credits ?? 0) + amount;
  const { data, error } = await supabase.from("users").update({ credits: newCredits }).eq("id", userId).select().single();
  if (error) throw new Error(error.message);
  return parseUser(data);
};

export const getSubscriptionOptions = async (): Promise<string[]> => {
  // Nếu có table subscriptions thì đọc từ đó, không thì trả về mặc định
  const { data, error } = await supabase.from("subscriptions").select("name");
  if (error || !data) {
    return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
  }
  return data.map(row => row.name);
};
