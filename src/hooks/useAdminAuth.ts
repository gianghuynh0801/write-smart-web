
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const defaultAdmin = {
  username: "admin",
  password: "admin@1238",
  email: "admin@writesmart.vn"
};

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (roleData && !roleError) {
            toast({
              title: "Đã đăng nhập",
              description: "Bạn đã đăng nhập với quyền quản trị.",
            });
            navigate("/admin");
            return;
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminSession();
  }, [navigate, toast]);

  const handleAdminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      if (username === defaultAdmin.username && password === defaultAdmin.password) {
        console.log("Đăng nhập với tài khoản admin mặc định");
        
        let authUser: User | null = null;
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: defaultAdmin.email,
          password: defaultAdmin.password,
        });

        if (signInError && signInError.message.includes("Invalid login credentials")) {
          console.log("Tài khoản admin chưa tồn tại, đăng ký mới");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: defaultAdmin.email,
            password: defaultAdmin.password,
          });

          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error("Không thể tạo tài khoản admin");
          
          authUser = signUpData.user;
        } else if (signInError) {
          throw signInError;
        } else {
          authUser = signInData.user;
        }

        if (!authUser) throw new Error("Không tìm thấy thông tin người dùng");
        
        await setupAdminUser(authUser);
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng quay trở lại, Admin!",
        });
        
        navigate("/admin");
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không chính xác",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isChecking, handleAdminLogin };
};

async function setupAdminUser(user: User) {
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
    .eq('role', 'admin')
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
