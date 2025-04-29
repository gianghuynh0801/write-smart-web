
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
  
  // Khởi tạo phiên làm việc và theo dõi sự thay đổi trạng thái xác thực
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

  return {
    state,
    setState,
    updateUserDetails,
    fetchUserDetails,
    checkAdminStatus,
    refreshSession
  };
}
