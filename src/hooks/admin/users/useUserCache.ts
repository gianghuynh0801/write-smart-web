
import { useState, useRef, useEffect, useMemo } from "react";
import { usersCache, clearUsersCache } from "@/utils/api/userApiUtils";
import { featureFlags } from "@/config/featureFlags";

export const useUserCache = () => {
  // Theo dõi thời gian refresh cuối cùng để tránh refresh quá nhanh
  const lastRefreshTime = useRef(0);
  // Tăng khoảng thời gian tối thiểu giữa các lần refresh lên 30 giây
  const minRefreshInterval = 30000; // 30 giây giữa các lần refresh
  // Biến cờ để đánh dấu đã tải dữ liệu lần đầu
  const initialLoadDone = useRef(false);

  // Cache memoized để tránh tính toán lại
  const cachedParams = useMemo(() => {
    return usersCache?.params || null;
  }, []);

  // Không xóa cache khi component unmount để giữ dữ liệu cho lần sau
  useEffect(() => {
    // Kiểm tra xem đã có dữ liệu trong sessionStorage chưa
    const hasSessionData = sessionStorage.getItem('users_data_loaded');
    if (hasSessionData === 'true') {
      initialLoadDone.current = true;
    }
    
    return () => {
      if (initialLoadDone.current) {
        sessionStorage.setItem('users_data_loaded', 'true');
      }
      console.log("[useUserCache] Component unmount, giữ cache");
    };
  }, []);

  const checkRefreshThrottle = async () => {
    // Nếu là lần đầu tiên tải, luôn cho phép
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      sessionStorage.setItem('users_data_loaded', 'true');
      console.log("[useUserCache] Lần đầu tiên tải, cho phép refresh");
      return true;
    }
    
    const now = Date.now();
    if (now - lastRefreshTime.current < minRefreshInterval) {
      console.log(`[useUserCache] Hạn chế tần suất refresh: ${Math.round((minRefreshInterval - (now - lastRefreshTime.current)) / 1000)}s còn lại`);
      // Trả về false nếu chưa đủ thời gian để refresh
      return false;
    }
    
    lastRefreshTime.current = Date.now();
    console.log(`[useUserCache] Cho phép refresh lúc ${new Date(lastRefreshTime.current).toLocaleTimeString()}`);
    return true;
  };

  return {
    hasCachedData: () => !!usersCache,
    getCachedParams: () => cachedParams,
    checkRefreshThrottle,
    lastRefreshTime,
    minRefreshInterval,
    initialLoadDone
  };
};
