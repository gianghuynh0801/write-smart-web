
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const defaultAdmin = {
  username: "admin",
  password: "admin@1238",
  email: "admin@example.com"
};

export async function setupAdminUser(user: User) {
  console.log("Đăng nhập thành công, user ID:", user.id);

  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email!,
      name: "Admin",
      role: "admin",
      status: "active",
    });

  if (userError) {
    console.error("Lỗi khi cập nhật user:", userError);
    throw userError;
  }

  console.log("Đã cập nhật thông tin user");

  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', "admin")
    .single();

  if (!existingRole) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: "admin",
      });

    if (roleError) {
      console.error("Lỗi khi thêm vai trò admin:", roleError);
      throw roleError;
    }
    
    console.log("Đã thêm vai trò admin");
  } else {
    console.log("Vai trò admin đã tồn tại");
  }
}

export async function checkAdminRole(userId: string) {
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  return { roleData, roleError };
}

export async function createAdminAccount() {
  // Trước tiên kiểm tra xem tài khoản đã tồn tại chưa
  const { data: existingUser } = await supabase.auth.signInWithPassword({
    email: defaultAdmin.email,
    password: defaultAdmin.password,
  });

  if (existingUser.user) {
    console.log("Tài khoản admin đã tồn tại, sử dụng tài khoản này");
    return existingUser.user;
  }

  // Nếu chưa tồn tại, tạo mới
  console.log("Tạo mới tài khoản admin");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: defaultAdmin.email,
    password: defaultAdmin.password,
  });

  if (signUpError) {
    console.error("Lỗi khi đăng ký tài khoản admin:", signUpError);
    throw signUpError;
  }
  
  if (!signUpData.user) {
    throw new Error("Không thể tạo tài khoản admin");
  }
  
  return signUpData.user;
}
