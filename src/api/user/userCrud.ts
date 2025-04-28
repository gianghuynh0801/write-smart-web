import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin, getUserActiveSubscription } from "./adminOperations";
import { handleSubscriptionChange } from "./userSubscription";

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

// Hàm chuyển đổi dữ liệu từ database thành đối tượng User
export function parseUser(row: any): User {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    credits: row.credits ?? 0,
    subscription: row.subscription ?? "Không có",
    status: row.status === "inactive" ? "inactive" : "active",
    registeredAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    avatar: row.avatar || `https://i.pravatar.cc/150?u=${row.id}`,
    role: row.role === "admin" || row.role === "editor" ? row.role : "user",
    email_verified: !!row.email_verified
  };
}

// Hàm đồng bộ dữ liệu mẫu vào database nếu cần
export const syncMockUsersToDbIfNeeded = async () => {
  try {
    console.log("Kiểm tra và đồng bộ dữ liệu người dùng mẫu nếu cần");
    const { count, error } = await supabase.from("users").select("id", { count: "exact", head: true });
    
    if (error) {
      console.error("Lỗi khi kiểm tra bảng users:", error.message);
      return; // Không đồng bộ nếu có lỗi truy vấn
    }
    
    if ((count ?? 0) === 0) {
      console.log("Bảng users trống, tiến hành thêm dữ liệu mẫu");
      const toInsert = mockUsers.map(u => ({
        ...u,
        created_at: u.registeredAt,
        id: crypto.randomUUID()
      }));
      
      const { error: insertError } = await supabase.from("users").insert(toInsert as any);
      if (insertError) {
        console.error("Lỗi khi thêm dữ liệu mẫu:", insertError.message);
      } else {
        console.log("Đã thêm dữ liệu mẫu thành công");
      }
    } else {
      console.log("Bảng users đã có dữ liệu, không cần đồng bộ");
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu mẫu:", error);
  }
};

export const fetchUsers = async (
  page = 1,
  pageSize = 5,
  status: string = "all",
  searchTerm: string = ""
): Promise<{ data: User[]; total: number }> => {
  try {
    await syncMockUsersToDbIfNeeded();
    console.log("Đang lấy danh sách người dùng với các thông số:", { page, pageSize, status, searchTerm });

    // Lấy token JWT của người dùng hiện tại
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

    // Gọi Edge Function để lấy danh sách người dùng với quyền admin
    const response = await supabase.functions.invoke('admin-users', {
      body: {
        page,
        pageSize,
        status,
        searchTerm
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (response.error) {
      throw new Error(`Lỗi API: ${response.error.message}`);
    }

    if (!response.data) {
      throw new Error("Không nhận được dữ liệu từ API");
    }

    const { data: users, total } = response.data;
    
    console.log(`Đã lấy được ${users?.length || 0} người dùng, tổng số: ${total || 0}`);
    
    return {
      data: users || [],
      total: total || 0
    };
  } catch (error) {
    console.error("Lỗi không mong muốn khi lấy danh sách users:", error);
    // Trả về dữ liệu mẫu nếu có lỗi
    const mockData = mockUsers.slice((page - 1) * pageSize, page * pageSize);
    return {
      data: mockData,
      total: mockUsers.length
    };
  }
};

export const getUserById = async (id: string | number): Promise<User | undefined> => {
  const userId = String(id);
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  
  if (error) throw new Error("Không tìm thấy người dùng");
  if (!data) return undefined;
  
  // Get current subscription
  const userWithSubscription = parseUser(data);
  
  try {
    const subscriptionData = await getUserActiveSubscription(userId);
    if (subscriptionData && subscriptionData.subscriptions) {
      userWithSubscription.subscription = subscriptionData.subscriptions.name;
    }
  } catch (subError) {
    console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
    // Tiếp tục sử dụng dữ liệu người dùng mà không có thông tin gói đăng ký
  }
  
  return userWithSubscription;
};

export const createUser = async (userData: UserFormValues): Promise<User> => {
  const newId = crypto.randomUUID();
  const { data, error } = await supabase.from("users").insert([
    {
      id: newId,
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: userData.role
    }
  ]).select().single();

  if (error) throw new Error(error.message);
  
  const createdUser = parseUser(data);

  // [NOTE!] The trigger handle_new_user_subscription() automatically creates a default subscription for every user.
  // Only create a user_subscriptions record IF the admin selects a different package than the default (e.g., "Không có" meaning no subscription, or a package other than default).
  if (
    userData.subscription &&
    userData.subscription !== "Không có" &&
    userData.subscription !== "Cơ bản"
  ) {
    try {
      // Get subscription info by name
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("name", userData.subscription)
        .maybeSingle();
      
      if (subscriptionData) {
        // Calculate subscription dates
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await createUserSubscriptionAsAdmin(
          newId,
          subscriptionData.id,
          startDate,
          endDateStr
        );
      }
    } catch (subError) {
      console.error("Could not update subscription info:", subError);
      throw new Error(`Could not create subscription: ${subError instanceof Error ? subError.message : String(subError)}`);
    }
  }

  createdUser.subscription = userData.subscription; // Update subscription field in return object
  return createdUser;
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  const userId = String(id);
  
  // Get current user data for comparison
  const currentUser = await getUserById(userId);
  
  // Update basic user information
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
  
  const updatedUser = parseUser(data);
  
  // Check if subscription has changed and update if needed
  if (currentUser && currentUser.subscription !== userData.subscription) {
    try {
      // Sử dụng hàm riêng để xử lý thay đổi gói đăng ký
      const result = await handleSubscriptionChange(userId, userData.subscription);
      
      if (!result.success) {
        console.error("Lỗi khi thay đổi gói đăng ký:", result.message);
        // Vẫn tiếp tục vì không muốn toàn bộ quá trình cập nhật bị lỗi
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      // Vẫn tiếp tục vì không muốn toàn bộ quá trình cập nhật bị lỗi
    }
  }

  updatedUser.subscription = userData.subscription;
  return updatedUser;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};
