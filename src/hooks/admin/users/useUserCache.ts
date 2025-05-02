
import { useState, useRef, useEffect, useMemo } from "react";
import { usersCache, clearUsersCache } from "@/utils/api/userApiUtils";
import { featureFlags } from "@/config/featureFlags";

export const useUserCache = () => {
  // Theo dõi thời gian refresh cuối cùng để tránh refresh quá nhanh
  const lastRefreshTime = useRef(0);
  // Giảm khoảng thời gian tối thiểu giữa các lần refresh xuống 5 giây để cải thiện UX
  const minRefreshInterval = 5000; // 5 giây giữa các lần refresh
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

  const checkRefreshThrottle = async (forceRefresh = false) => {
    // Nếu yêu cầu force refresh, bỏ qua kiểm tra throttle
    if (forceRefresh) {
      console.log("[useUserCache] Force refresh được yêu cầu, bỏ qua kiểm tra thời gian");
      lastRefreshTime.current = Date.now();
      return true;
    }
    
    // Nếu là lần đầu tiên tải, luôn cho phép
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      sessionStorage.setItem('users_data_loaded', 'true');
      console.log("[useUserCache] Lần đầu tiên tải, cho phép refresh");
      return true;
    }
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    console.log(`[useUserCache] Kiểm tra tần suất refresh: Đã ${Math.round(timeSinceLastRefresh / 1000)}s từ lần cuối (giới hạn: ${minRefreshInterval / 1000}s)`);
    
    // Giảm thời gian chờ để cải thiện trải nghiệm người dùng
    if (timeSinceLastRefresh < minRefreshInterval) {
      console.log(`[useUserCache] Hạn chế tần suất refresh: ${Math.round((minRefreshInterval - timeSinceLastRefresh) / 1000)}s còn lại`);
      // Trả về false nếu chưa đủ thời gian để refresh
      return false;
    }
    
    lastRefreshTime.current = now;
    console.log(`[useUserCache] Cho phép refresh lúc ${new Date(lastRefreshTime.current).toLocaleTimeString()}`);
    return true;
  };

  // Thêm hàm forceClearCache để xóa cache bắt buộc khi cần thiết
  const forceClearCache = () => {
    console.log("[useUserCache] Xóa cache bắt buộc");
    clearUsersCache();
    lastRefreshTime.current = 0;  // Reset thời gian refresh
  };

  return {
    hasCachedData: () => !!usersCache,
    getCachedParams: () => cachedParams,
    checkRefreshThrottle,
    lastRefreshTime,
    minRefreshInterval,
    initialLoadDone,
    forceClearCache
  };
};
