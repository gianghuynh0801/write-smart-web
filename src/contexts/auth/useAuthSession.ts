
import { useState, useCallback, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, UserDetails } from "./types";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

export function useAuthSession() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    userDetails: null,
    isAdmin: false,
    isLoading: true,
    isChecking: true,
    error: null
  });
  
  const [adminCheckCache, setAdminCheckCache] = useState<Record<string, {result: boolean, timestamp: number}>>({});
  const [refreshingSession, setRefreshingSession] = useState(false);
  
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

      // Thêm timeout để tránh treo vô hạn
      const getUserPromise = supabase
        .from('users')
        .select('credits, email_verified, subscription')
        .eq('id', targetUserId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi lấy thông tin người dùng")), 5000)
      );
      
      // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
      const { data: userData, error: userError } = await Promise.race([
        getUserPromise,
        timeoutPromise
      ]) as any;

      if (userError) {
        console.error("Lỗi khi lấy thông tin người dùng:", userError);
        return null;
      }

      // Lấy thông tin gói đăng ký hiện tại với timeout
      const getSubPromise = supabase
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
        
      const subTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi lấy thông tin gói đăng ký")), 5000)
      );
      
      // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
      const { data: subData, error: subError } = await Promise.race([
        getSubPromise,
        subTimeoutPromise
      ]) as any;

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
  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
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
      
      // Thêm timeout để tránh treo vô hạn
      const rpcPromise = supabase.rpc('is_admin', { uid: targetUserId });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi kiểm tra quyền admin")), 5000)
      );
      
      try {
        // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
        const { data: isAdmin, error: rpcError } = await Promise.race([
          rpcPromise,
          timeoutPromise
        ]) as any;
        
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
      
      // Fallback: kiểm tra từ database nếu RPC không thành công
      try {
        const rolePromise = supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('role', 'admin')
          .maybeSingle();
          
        const roleTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout khi kiểm tra bảng user_roles")), 5000)
        );
        
        // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
        const { data: roleData, error: roleError } = await Promise.race([
          rolePromise,
          roleTimeoutPromise
        ]) as any;
        
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
    if (refreshingSession) {
      console.log("Đã có yêu cầu làm mới session, bỏ qua yêu cầu mới");
      return false;
    }
    
    try {
      setRefreshingSession(true);
      console.log("Đang làm mới session...");
      
      // Thêm timeout để tránh treo vô hạn
      const refreshPromise = supabase.auth.refreshSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi làm mới session")), 8000)
      );
      
      // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
      const { data, error } = await Promise.race([
        refreshPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error("Lỗi khi làm mới session:", error);
        return false;
      }
      
      if (data?.session) {
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
    } finally {
      setRefreshingSession(false);
    }
  }, [refreshingSession]);
  
  // Khởi tạo phiên làm việc và theo dõi sự thay đổi trạng thái xác thực
  useEffect(() => {
    let isMounted = true;
    let authStateTimeout: number;
    
    const initializeAuth = async () => {
      try {
        console.log("Khởi tạo AuthContext...");
        
        // Thiết lập timeout dự phòng để đảm bảo không bị kẹt vô thời hạn
        authStateTimeout = window.setTimeout(() => {
          if (isMounted) {
            console.log("[AuthContext] Timeout khi khởi tạo auth");
            setState(prev => ({
              ...prev,
              isLoading: false,
              isChecking: false,
              error: "Timeout khi khởi tạo phiên làm việc"
            }));
          }
        }, 10000); // Timeout sau 10 giây
        
        // Trước tiên, thiết lập lắng nghe sự kiện thay đổi trạng thái xác thực
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Sự kiện auth thay đổi:", event);
            
            if (!isMounted) return;
            
            if (event === 'SIGNED_IN' && currentSession) {
              console.log("Người dùng đã đăng nhập, lưu token");
              setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, currentSession.access_token);
              
              // Sử dụng setTimeout để tránh vòng lặp với getSession
              setTimeout(async () => {
                const isAdmin = await checkAdminStatus(currentSession.user.id);
                
                if (isMounted) {
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
                  fetchUserDetails(currentSession.user.id);
                }
              }, 0);
            } else if (event === 'TOKEN_REFRESHED' && currentSession) {
              console.log("Token đã được làm mới");
              setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, currentSession.access_token);
              
              // Sử dụng setTimeout để tránh vòng lặp với getSession
              setTimeout(async () => {
                const isAdmin = await checkAdminStatus(currentSession.user.id);
                
                if (isMounted) {
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
                  fetchUserDetails(currentSession.user.id);
                }
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
        try {
          // Thêm timeout để tránh treo vô hạn
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout khi lấy phiên làm việc hiện tại")), 5000)
          );
          
          // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
          const { data, error } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
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
          
          if (data?.session) {
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
                if (isMounted) {
                  fetchUserDetails(data.session.user.id);
                }
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
        
        clearTimeout(authStateTimeout);
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
      clearTimeout(authStateTimeout);
    };
  }, [checkAdminStatus, fetchUserDetails]);

  return {
    state,
    setState,
    updateUserDetails,
    fetchUserDetails,
    checkAdminStatus,
    refreshSession
  };
}
