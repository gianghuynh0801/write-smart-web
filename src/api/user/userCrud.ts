
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
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

export function parseUser(row: any): User {
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

export const syncMockUsersToDbIfNeeded = async () => {
  const { count } = await supabase.from("users").select("id", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    const toInsert = mockUsers.map(u => ({
      ...u,
      created_at: u.registeredAt,
      id: crypto.randomUUID()
    }));
    await supabase.from("users").insert(toInsert as any);
  }
};

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

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (searchTerm) {
    query = query
      .or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
  }

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
  const userId = String(id);
  const currentUser = await getUserById(userId);
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
  updatedUser.subscription = userData.subscription;

  if (currentUser && currentUser.subscription !== userData.subscription) {
    try {
      await handleSubscriptionChange(userId, userData.subscription);
    } catch (subError) {
      console.error("Không thể cập nhật thông tin đăng ký:", subError);
    }
  }

  return updatedUser;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};
