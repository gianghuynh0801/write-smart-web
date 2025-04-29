
import { useState, useRef, useEffect } from "react";
import { usersCache, clearUsersCache } from "@/utils/api/userApiUtils";
import { featureFlags } from "@/config/featureFlags";

export const useUserCache = () => {
  // Theo dõi thời gian refresh cuối cùng để tránh refresh quá nhanh
  const lastRefreshTime = useRef(0);
  // Tăng khoảng thời gian tối thiểu giữa các lần refresh lên 15 giây
  const minRefreshInterval = 15000; // 15 giây giữa các lần refresh

  // Không xóa cache khi component unmount để giữ dữ liệu cho lần sau
  useEffect(() => {
    return () => {
      console.log("[useUserCache] Component unmount, giữ cache");
    };
  }, []);

  const checkRefreshThrottle = async () => {
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
    hasCachedData: () => usersCache !== null,
    getCachedParams: () => usersCache?.params || null,
    checkRefreshThrottle,
    lastRefreshTime,
    minRefreshInterval
  };
};
