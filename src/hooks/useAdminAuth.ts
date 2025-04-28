
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { defaultAdmin } from "@/services/admin/adminService";

export { defaultAdmin } from "@/services/admin/adminService";

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkExistingSession = async () => {
      try {
        console.log("Kiểm tra phiên hiện tại...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Lỗi khi kiểm tra phiên:", error);
          if (isMounted) setIsChecking(false);
          return;
        }
        
        if (data.session) {
          console.log("Đã tìm thấy phiên hiện tại:", data.session.user.id);
          
          // Kiểm tra xem phiên hiện tại có phải của tài khoản admin mặc định không
          if (data.session.user.email === defaultAdmin.email) {
            console.log("Phiên hiện tại là của tài khoản admin, chuyển hướng...");
            if (isMounted) navigate("/admin");
            return;
          }

          // Kiểm tra quyền admin
          try {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', data.session.user.id)
              .eq('role', 'admin')
              .maybeSingle();
              
            if (!roleError && roleData) {
              console.log("Tìm thấy quyền admin, chuyển hướng...");
              if (isMounted) navigate("/admin");
              return;
            }
          } catch (e) {
            console.error("Lỗi khi kiểm tra quyền admin:", e);
          }
        }
      } catch (error) {
        console.error("Lỗi không xác định khi kiểm tra phiên:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    // Thiết lập timeout để đảm bảo không bị kẹt vô thời hạn
    const timeoutId = setTimeout(() => {
      if (isMounted && isChecking) {
        console.log("Timeout khi kiểm tra phiên, đặt trạng thái isChecking = false");
        setIsChecking(false);
      }
    }, 5000); // Timeout sau 5 giây
    
    checkExistingSession();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  const validateInput = (usernameOrEmail: string, password: string) => {
    if (!usernameOrEmail || !password) {
      throw new Error("Vui lòng điền đầy đủ thông tin đăng nhập");
    }

    // Kiểm tra định dạng email nếu người dùng nhập email
    if (usernameOrEmail.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usernameOrEmail)) {
        throw new Error("Định dạng email không hợp lệ");
      }
    }
  };

  const handleAdminLogin = async (usernameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Validate input
      validateInput(usernameOrEmail, password);

      // Kiểm tra xem đăng nhập bằng username hay email
      const isDefaultAdmin = 
        (usernameOrEmail === defaultAdmin.username || usernameOrEmail === defaultAdmin.email) && 
        password === defaultAdmin.password;

      if (!isDefaultAdmin) {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không chính xác",
          variant: "destructive",
        });
        return;
      }

      console.log("Đăng nhập với tài khoản admin mặc định");
      
      // Đảm bảo đăng xuất trước khi đăng nhập để tránh xung đột
      await supabase.auth.signOut();
      
      // Thực hiện đăng nhập với Supabase
      // Sử dụng email của admin mặc định để đăng nhập vì Supabase chỉ chấp nhận email
      const emailToUse = defaultAdmin.email;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: defaultAdmin.password,
      });

      if (error) {
        console.error('Lỗi đăng nhập:', error);
        toast({
          title: "Đăng nhập thất bại",
          description: error.message || "Có lỗi xảy ra khi đăng nhập, vui lòng thử lại sau",
          variant: "destructive",
        });
        return;
      }

      if (!data.user) {
        throw new Error("Không thể lấy thông tin người dùng");
      }

      // Đăng nhập thành công
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng quay trở lại!",
      });

      // Điều hướng đến trang admin
      navigate("/admin");
      
    } catch (error) {
      console.error('Lỗi xử lý đăng nhập:', error);
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
