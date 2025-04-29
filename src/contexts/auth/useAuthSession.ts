
import { useState, useCallback, useEffect, useMemo } from "react";
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
  
  // Hàm cập nhật thông tin chi tiết người dùng - cache kết quả để tránh re-render
  const updateUserDetails = useCallback((details: UserDetails) => {
    setState(prev => ({
      ...prev,
      userDetails: {
        ...prev.userDetails,
        ...details
      }
    }));
  }, []);

  // Tăng thời gian cache admin check lên 10 phút
  const adminCacheDuration = 600000; // 10 phút

  // Hàm lấy thông tin chi tiết người dùng từ database - với memoization để tránh gọi nhiều lần
  const fetchUserDetails = useCallback(async (userId?: string): Promise<UserDetails | null> => {
    try {
      const targetUserId = userId || state.user?.id;
      if (!targetUserId) return null;

      console.log("Đang lấy thông tin chi tiết người dùng:", targetUserId);

      // Thêm timeout để tránh treo vô hạn
      const getUserPromise = supabase
        .from('users')
        .select('credits, email_verified, subscription, role') // Thêm role để giảm số lần gọi API
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

      // Nếu có role = 'admin' từ bảng users, cache luôn kết quả này để tránh phải gọi API kiểm tra admin
      if (userData?.role === 'admin') {
        setAdminCheckCache(prev => ({
          ...prev,
          [targetUserId]: { result: true, timestamp: Date.now() }
        }));
        
        if (targetUserId === state.user?.id) {
          setState(prev => ({ ...prev, isAdmin: true }));
        }
      }

      // Lấy thông tin gói đăng ký hiện tại với timeout - CHỈ khi cần thiết
      let subData = null;
      
      if (!userData?.subscription || userData.subscription === "Không có") {
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
        const { data: subscriptionData, error: subError } = await Promise.race([
          getSubPromise,
          subTimeoutPromise
        ]) as any;
        
        if (!subError) {
          subData = subscriptionData;
        }
      }

      // Kết hợp thông tin
      const userDetails = {
        ...userData,
        subscription: subData?.subscriptions?.name || userData?.subscription || "Không có",
        subscription_end_date: subData?.end_date,
        subscription_status: subData?.status
      };

      updateUserDetails(userDetails);
      console.log("Đã lấy thông tin chi tiết người dùng");
      return userDetails;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết người dùng:", error);
      return null;
    }
  }, [state.user?.id, updateUserDetails]);

  // Kiểm tra cache trước khi gọi hàm
  const getUserDetailsWithCache = useCallback(async (userId?: string) => {
    // Tránh lặp lại các request nếu đã có dữ liệu
    if (state.userDetails && userId === state.user?.id) {
      return state.userDetails;
    }
    return fetchUserDetails(userId);
  }, [state.userDetails, state.user?.id, fetchUserDetails]);

  // Hàm kiểm tra quyền admin với cache - tối ưu hóa để giảm API calls
  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    try {
      const targetUserId = userId || state.user?.id;
      if (!targetUserId) return false;
      
      // Kiểm tra cache trước
      const cached = adminCheckCache[targetUserId];
      const now = Date.now();
      
      // Tăng thời gian cache lên 10 phút
      if (cached && (now - cached.timestamp) < adminCacheDuration) {
        console.log("Dùng kết quả admin check từ cache");
        return cached.result;
      }

      // Kiểm tra từ user details trước nếu có - có thể đã có role = admin
      const userDetails = await getUserDetailsWithCache(targetUserId);
      if (userDetails?.role === 'admin') {
        console.log("Xác định quyền admin từ user details");
        setAdminCheckCache(prev => ({
          ...prev,
          [targetUserId]: { result: true, timestamp: now }
        }));
        return true;
      }

      console.log("Kiểm tra quyền admin cho user:", targetUserId);
      
      // Thử gọi RPC is_admin từ database - nhanh nhất
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: targetUserId });
        
        if (!rpcError && isAdmin === true) {
          console.log("Xác định quyền admin qua RPC function");
          setAdminCheckCache(prev => ({
            ...prev,
            [targetUserId]: { result: true, timestamp: now }
          }));
          return true;
        }
      } catch (err) {
        console.log("Lỗi khi gọi RPC is_admin:", err);
      }
      
      // Kiểm tra từ user_roles nếu RPC không thành công
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          console.log("Xác định quyền admin qua user_roles");
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
  }, [state.user, adminCheckCache, adminCacheDuration, getUserDetailsWithCache]);

  // Tối ưu hóa refreshSession để giảm số lần gọi API
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

  // Khởi tạo auth context chỉ một lần khi component mount
  useEffect(() => {
    let isMounted = true;
    let authStateTimeout: number;
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    
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
        
        // Thiết lập lắng nghe sự kiện thay đổi trạng thái xác thực
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Sự kiện auth thay đổi:", event);
            
            if (!isMounted) return;
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (currentSession) {
                console.log(`Người dùng ${event === 'SIGNED_IN' ? 'đã đăng nhập' : 'đã làm mới token'}`);
                setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, currentSession.access_token);
                
                setState(prev => ({
                  ...prev,
                  session: currentSession,
                  user: currentSession.user,
                  isLoading: false,
                  isChecking: false,
                  error: null
                }));
                
                // QUAN TRỌNG: Sử dụng setTimeout để tránh vòng lặp
                setTimeout(() => {
                  if (isMounted) {
                    // Kiểm tra quyền admin
                    checkAdminStatus(currentSession.user.id).then(isAdmin => {
                      if (isMounted) {
                        setState(prev => ({ ...prev, isAdmin }));
                      }
                    });
                    
                    // Lấy thông tin chi tiết người dùng
                    fetchUserDetails(currentSession.user.id);
                  }
                }, 0);
              }
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
        
        // Sau khi thiết lập listeners, kiểm tra session hiện tại
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
            console.log("Đã tìm thấy session");
            setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, data.session.access_token);
            
            if (isMounted) {
              setState(prev => ({
                ...prev,
                session: data.session,
                user: data.session.user,
                isLoading: false,
                isChecking: false
              }));

              // QUAN TRỌNG: Sử dụng setTimeout để tránh vòng lặp
              setTimeout(() => {
                if (isMounted) {
                  // Kiểm tra quyền admin
                  checkAdminStatus(data.session.user.id).then(isAdmin => {
                    if (isMounted) {
                      setState(prev => ({ ...prev, isAdmin }));
                    }
                  });
                  
                  // Lấy thông tin chi tiết người dùng
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
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []); // Chỉ chạy một lần khi component mount

  return {
    state,
    setState,
    updateUserDetails,
    fetchUserDetails: getUserDetailsWithCache,
    checkAdminStatus,
    refreshSession
  };
}
