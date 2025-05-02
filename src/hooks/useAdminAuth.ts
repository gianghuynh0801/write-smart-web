
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let checkSessionTimeout: number;
    
    const checkExistingSession = async () => {
      try {
        console.log("Kiểm tra phiên hiện tại...");
        
        // Thêm timeout cho quá trình kiểm tra session để tránh treo vô hạn
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout khi lấy phiên đăng nhập")), 5000)
        );
        
        // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
        const { data } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } };
        
        if (!data?.session) {
          console.log("Không có phiên hiện tại");
          if (isMounted) setIsChecking(false);
          return;
        }
        
        console.log("Đã tìm thấy phiên hiện tại:", data.session.user.id);
        
        // Kiểm tra xem phiên hiện tại có phải của tài khoản admin mặc định không
        if (data.session.user.email === defaultAdmin.email) {
          console.log("Phiên hiện tại là của tài khoản admin, chuyển hướng...");
          if (isMounted) navigate("/admin");
          return;
        }

        // Kiểm tra quyền admin bằng RPC function để tăng hiệu suất
        try {
          const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { 
            uid: data.session.user.id 
          });
          
          if (!rpcError && isAdmin === true) {
            console.log("Xác định là admin qua RPC, chuyển hướng...");
            if (isMounted) navigate("/admin");
            return;
          } else {
            console.log("Không phải admin hoặc lỗi RPC, kiểm tra database...");
            // Fallback: Kiểm tra qua database
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', data.session.user.id)
              .eq('role', 'admin' as any)
              .maybeSingle();
              
            if (!roleError && roleData) {
              console.log("Tìm thấy quyền admin, chuyển hướng...");
              if (isMounted) navigate("/admin");
              return;
            } else {
              console.log("Không tìm thấy quyền admin", roleError);
            }
          }
        } catch (e) {
          console.error("Lỗi khi kiểm tra quyền admin:", e);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra phiên đăng nhập:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    checkExistingSession();
    
    // Thiết lập timeout dự phòng để đảm bảo không bị kẹt vô thời hạn
    checkSessionTimeout = window.setTimeout(() => {
      if (isMounted && isChecking) {
        console.log("Timeout khi kiểm tra phiên, đặt trạng thái isChecking = false");
        setIsChecking(false);
      }
    }, 6000); // Timeout sau 6 giây
    
    return () => {
      isMounted = false;
      clearTimeout(checkSessionTimeout);
    };
  }, [navigate]);

  const handleAdminLogin = async (usernameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate input
      if (!usernameOrEmail || !password) {
        setError("Vui lòng điền đầy đủ thông tin đăng nhập");
        return;
      }

      // Kiểm tra xem đăng nhập bằng username hay email
      const isDefaultAdmin = 
        (usernameOrEmail === defaultAdmin.username || usernameOrEmail === defaultAdmin.email) && 
        password === defaultAdmin.password;

      if (!isDefaultAdmin) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
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
      
      // Thêm timeout để tránh treo vô hạn
      const signInPromise = supabase.auth.signInWithPassword({
        email: emailToUse,
        password: defaultAdmin.password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi đăng nhập")), 8000)
      );
      
      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Lỗi đăng nhập:', error);
        setError(error.message || "Có lỗi xảy ra khi đăng nhập");
        toast({
          title: "Đăng nhập thất bại",
          description: error.message || "Có lỗi xảy ra khi đăng nhập, vui lòng thử lại sau",
          variant: "destructive",
        });
        return;
      }

      if (!data?.user) {
        setError("Không thể lấy thông tin người dùng");
        throw new Error("Không thể lấy thông tin người dùng");
      }

      // Đăng nhập thành công
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng quay trở lại!",
      });

      // Điều hướng đến trang admin
      navigate("/admin", { replace: true });
      
    } catch (error) {
      console.error('Lỗi xử lý đăng nhập:', error);
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập");
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isChecking, error, handleAdminLogin };
};
