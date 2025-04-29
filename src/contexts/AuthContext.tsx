
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { setItem, getItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

interface UserDetails {
  credits?: number;
  subscription?: string;
  email_verified?: boolean;
  subscription_end_date?: string;
  subscription_status?: string;
  [key: string]: any;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null;
  isAdmin: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  updateUserDetails: (details: UserDetails) => void;
  fetchUserDetails: (userId?: string) => Promise<UserDetails | null>;
}

const initialAuthState: AuthState = {
  session: null,
  user: null,
  userDetails: null,
  isAdmin: false,
  isLoading: true,
  isChecking: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => false,
  checkAdminStatus: async () => false,
  updateUserDetails: () => {},
  fetchUserDetails: async () => null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [adminCheckCache, setAdminCheckCache] = useState<Record<string, {result: boolean, timestamp: number}>>({});
  
  // Hàm cập nhật thông tin chi tiết người dùng
  const updateUserDetails = useCallback((details: UserDetails) => {
    setState(prev => ({
      ...prev,
      userDetails: {
        ...prev.userDetails,
        ...details
      }
    }));
  }, []);

  // Hàm lấy thông tin chi tiết người dùng từ database
  const fetchUserDetails = useCallback(async (userId?: string): Promise<UserDetails | null> => {
    try {
      const targetUserId = userId || state.user?.id;
      if (!targetUserId) return null;

      console.log("Đang lấy thông tin chi tiết người dùng:", targetUserId);

      // Lấy thông tin từ bảng users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits, email_verified, subscription')
        .eq('id', targetUserId)
        .single();

      if (userError) {
        console.error("Lỗi khi lấy thông tin người dùng:", userError);
        return null;
      }

      // Lấy thông tin gói đăng ký hiện tại
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          subscription_id,
          end_date,
          status,
          subscriptions (
            name,
            features
          )
        `)
        .eq('user_id', targetUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
      }

      // Kết hợp thông tin
      const userDetails = {
        ...userData,
        subscription: subData?.subscriptions?.name || userData?.subscription || "Không có",
        subscription_end_date: subData?.end_date,
        subscription_status: subData?.status
      };

      updateUserDetails(userDetails);
      console.log("Đã lấy thông tin chi tiết người dùng:", userDetails);
      return userDetails;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết người dùng:", error);
      return null;
    }
  }, [state.user?.id, updateUserDetails]);

  // Hàm kiểm tra quyền admin với cache để tránh gọi API liên tục
  const checkAdminStatus = useCallback(async (userId?: string) => {
    try {
      const targetUserId = userId || state.user?.id;
      if (!targetUserId) return false;
      
      // Kiểm tra cache
      const cached = adminCheckCache[targetUserId];
      const now = Date.now();
      // Cache có hiệu lực trong 5 phút
      if (cached && (now - cached.timestamp) < 300000) {
        return cached.result;
      }

      console.log("Kiểm tra quyền admin cho user:", targetUserId);
      
      // Thử 1: Kiểm tra từ RPC function is_admin
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: targetUserId });
        
        if (!rpcError && isAdmin === true) {
          console.log("Xác định quyền admin qua RPC function:", isAdmin);
          setAdminCheckCache(prev => ({
            ...prev,
            [targetUserId]: { result: true, timestamp: now }
          }));
          return true;
        }
      } catch (err) {
        console.log("Lỗi khi gọi RPC is_admin:", err);
      }
      
      // Thử 2: Kiểm tra từ bảng user_roles
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          console.log("Xác định quyền admin qua user_roles:", roleData);
          setAdminCheckCache(prev => ({
            ...prev,
            [targetUserId]: { result: true, timestamp: now }
          }));
          return true;
        }
      } catch (err) {
        console.log("Lỗi khi kiểm tra bảng user_roles:", err);
      }
      
      // Thử 3: Kiểm tra từ trường role trong bảng users
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', targetUserId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          console.log("Xác định quyền admin qua trường role:", userData);
          setAdminCheckCache(prev => ({
            ...prev,
            [targetUserId]: { result: true, timestamp: now }
          }));
          return true;
        }
      } catch (err) {
        console.log("Lỗi khi kiểm tra bảng users:", err);
      }
      
      // Không tìm thấy quyền admin
      setAdminCheckCache(prev => ({
        ...prev,
        [targetUserId]: { result: false, timestamp: now }
      }));
      return false;
    } catch (error) {
      console.error("Lỗi không xác định khi kiểm tra quyền admin:", error);
      return false;
    }
  }, [state.user, adminCheckCache]);
  
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Đang làm mới session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Lỗi khi làm mới session:", error);
        return false;
      }
      
      if (data.session) {
        console.log("Session đã được làm mới thành công");
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, data.session.access_token);
        
        setState(prev => ({
          ...prev,
          session: data.session,
          user: data.session.user,
          error: null
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Lỗi không xác định khi làm mới session:", error);
      return false;
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log("Khởi tạo AuthContext...");
        
        // Trước tiên, thiết lập lắng nghe sự kiện thay đổi trạng thái xác thực
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Sự kiện auth thay đổi:", event);
            
            if (!isMounted) return;
            
            if (event === 'SIGNED_IN' && currentSession) {
              console.log("Người dùng đã đăng nhập, lưu token");
              setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, currentSession.access_token);
              
              const isAdmin = await checkAdminStatus(currentSession.user.id);
              
              setState({
                session: currentSession,
                user: currentSession.user,
                userDetails: null, // Sẽ được cập nhật bởi fetchUserDetails
                isAdmin,
                isLoading: false,
                isChecking: false,
                error: null
              });

              // Lấy thông tin chi tiết người dùng
              setTimeout(() => {
                fetchUserDetails(currentSession.user.id);
              }, 0);
            } else if (event === 'TOKEN_REFRESHED' && currentSession) {
              console.log("Token đã được làm mới");
              setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, currentSession.access_token);
              
              const isAdmin = await checkAdminStatus(currentSession.user.id);
              
              setState(prev => ({
                ...prev,
                session: currentSession,
                user: currentSession.user,
                isAdmin,
                isLoading: false,
                isChecking: false,
                error: null
              }));

              // Lấy thông tin chi tiết người dùng
              setTimeout(() => {
                fetchUserDetails(currentSession.user.id);
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              console.log("Người dùng đã đăng xuất");
              setState({
                session: null,
                user: null,
                userDetails: null,
                isAdmin: false,
                isLoading: false,
                isChecking: false,
                error: null
              });
            }
          }
        );
        
        // Sau đó, kiểm tra session hiện tại
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Lỗi khi lấy session:", error);
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              isChecking: false,
              error: error.message
            }));
          }
          return;
        }
        
        if (data.session) {
          console.log("Đã tìm thấy session, user ID:", data.session.user.id);
          setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, data.session.access_token);
          
          const isAdmin = await checkAdminStatus(data.session.user.id);
          
          if (isMounted) {
            setState({
              session: data.session,
              user: data.session.user,
              userDetails: null, // Sẽ được cập nhật bởi fetchUserDetails
              isAdmin,
              isLoading: false,
              isChecking: false,
              error: null
            });

            // Lấy thông tin chi tiết người dùng
            setTimeout(() => {
              fetchUserDetails(data.session.user.id);
            }, 0);
          }
        } else {
          console.log("Không tìm thấy session");
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              isChecking: false
            }));
          }
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo auth:", error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isChecking: false,
            error: error instanceof Error ? error.message : "Lỗi không xác định"
          }));
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [checkAdminStatus, fetchUserDetails]);
  
  const login = async (email: string, password: string) => {
    try {
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
    }
  };
  
  const logout = async () => {
    try {
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
    }
  };
  
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    checkAdminStatus,
    updateUserDetails,
    fetchUserDetails
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
