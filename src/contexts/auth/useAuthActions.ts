
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, UserDetails } from "./types";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

interface UseAuthActionsProps {
  state: AuthState;
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  fetchUserDetails: (userId?: string) => Promise<UserDetails | null>;
}

export function useAuthActions({
  state,
  setState,
  checkAdminStatus,
  fetchUserDetails
}: UseAuthActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const login = async (email: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Lỗi đăng nhập:", error);
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        toast({
          title: "Đăng nhập thất bại",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data.session) {
        console.log("Đăng nhập thành công, lưu token");
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, data.session.access_token);
        
        const isAdmin = await checkAdminStatus(data.session.user.id);
        
        setState({
          session: data.session,
          user: data.session.user,
          userDetails: null, // Sẽ được cập nhật bởi fetchUserDetails
          isAdmin,
          isLoading: false,
          isChecking: false,
          error: null
        });

        // Lấy thông tin chi tiết người dùng sau khi đăng nhập thành công
        setTimeout(async () => {
          await fetchUserDetails(data.session.user.id);
        }, 0);
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng quay trở lại!"
        });
      }
    } catch (error) {
      console.error("Lỗi không xác định khi đăng nhập:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Lỗi không xác định"
      }));
      
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã xảy ra lỗi không mong muốn khi đăng nhập",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const logout = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Lỗi đăng xuất:", error);
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        
        toast({
          title: "Đăng xuất thất bại",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setState({
        session: null,
        user: null,
        userDetails: null,
        isAdmin: false,
        isLoading: false,
        isChecking: false,
        error: null
      });
      
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống"
      });
      
      navigate("/admin-login");
    } catch (error) {
      console.error("Lỗi không xác định khi đăng xuất:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Lỗi không xác định"
      }));
      
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã xảy ra lỗi không mong muốn khi đăng xuất",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    login,
    logout
  };
}
