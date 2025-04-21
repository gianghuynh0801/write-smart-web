
import { User, UserFormValues } from "@/types/user";

// Mock data - trong môi trường thực tế, thay thế bằng API calls
const users = [
  { 
    id: 1, 
    name: "Nguyễn Văn A", 
    email: "nguyenvana@example.com", 
    credits: 48, 
    subscription: "Chuyên nghiệp", 
    status: "active", 
    registeredAt: "2023-04-15",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "user"
  },
  { 
    id: 2, 
    name: "Trần Thị B", 
    email: "tranthib@example.com", 
    credits: 22, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-03-28",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: "user"
  },
  { 
    id: 3, 
    name: "Lê Văn C", 
    email: "levanc@example.com", 
    credits: 0, 
    subscription: "Không có", 
    status: "inactive", 
    registeredAt: "2023-02-10",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "admin"
  },
  { 
    id: 4, 
    name: "Phạm Thị D", 
    email: "phamthid@example.com", 
    credits: 89, 
    subscription: "Doanh nghiệp", 
    status: "active", 
    registeredAt: "2023-05-02",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: "editor"
  },
  { 
    id: 5, 
    name: "Hoàng Văn E", 
    email: "hoangvane@example.com", 
    credits: 12, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-04-20",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "user"
  },
  { 
    id: 6, 
    name: "Vũ Minh F", 
    email: "vuminhf@example.com", 
    credits: 35, 
    subscription: "Chuyên nghiệp", 
    status: "active", 
    registeredAt: "2023-06-15",
    avatar: "https://i.pravatar.cc/150?img=6",
    role: "user"
  },
  { 
    id: 7, 
    name: "Đặng Thu G", 
    email: "dangthug@example.com", 
    credits: 0, 
    subscription: "Không có", 
    status: "inactive", 
    registeredAt: "2023-03-10",
    avatar: "https://i.pravatar.cc/150?img=7",
    role: "editor"
  },
  { 
    id: 8, 
    name: "Bùi Thanh H", 
    email: "buithanhh@example.com", 
    credits: 18, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-07-05",
    avatar: "https://i.pravatar.cc/150?img=8",
    role: "user"
  },
  { 
    id: 9, 
    name: "Trương Anh I", 
    email: "truonganhi@example.com", 
    credits: 67, 
    subscription: "Doanh nghiệp", 
    status: "active", 
    registeredAt: "2023-05-20",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "user"
  },
  { 
    id: 10, 
    name: "Lý Minh J", 
    email: "lyminhj@example.com", 
    credits: 5, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-06-30",
    avatar: "https://i.pravatar.cc/150?img=10",
    role: "admin"
  },
  { 
    id: 11, 
    name: "Phan Thu K", 
    email: "phanthuk@example.com", 
    credits: 40, 
    subscription: "Chuyên nghiệp", 
    status: "active", 
    registeredAt: "2023-04-25",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "user"
  },
  { 
    id: 12, 
    name: "Đỗ Văn L", 
    email: "dovanl@example.com", 
    credits: 0, 
    subscription: "Không có", 
    status: "inactive", 
    registeredAt: "2023-02-18",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "user"
  }
];

export const fetchUsers = async (
  page = 1, 
  pageSize = 5, 
  status: string = "all", 
  searchTerm: string = ""
): Promise<{data: User[], total: number}> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API delay
  
  let filteredUsers = [...users];
  
  // Filter by status
  if (status !== "all") {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  
  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  }
  
  const total = filteredUsers.length;
  
  // Paginate
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return { data: paginatedUsers, total };
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulating API delay
  return users.find(user => user.id === id);
};

export const createUser = async (userData: UserFormValues): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API delay
  
  const newUser: User = {
    ...userData,
    id: Math.max(...users.map(u => u.id)) + 1,
    registeredAt: new Date().toISOString().split('T')[0],
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
  };
  
  users.push(newUser);
  return newUser;
};

export const updateUser = async (id: number, userData: UserFormValues): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API delay
  
  const index = users.findIndex(user => user.id === id);
  if (index === -1) throw new Error("Không tìm thấy người dùng");
  
  const updatedUser = {
    ...users[index],
    ...userData
  };
  
  users[index] = updatedUser;
  return updatedUser;
};

export const deleteUser = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API delay
  
  const index = users.findIndex(user => user.id === id);
  if (index === -1) throw new Error("Không tìm thấy người dùng");
  
  users.splice(index, 1);
};

export const addUserCredits = async (id: number, amount: number): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulating API delay
  
  const index = users.findIndex(user => user.id === id);
  if (index === -1) throw new Error("Không tìm thấy người dùng");
  
  users[index].credits += amount;
  return users[index];
};

export const getSubscriptionOptions = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
};
