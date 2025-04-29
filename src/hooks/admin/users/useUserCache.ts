
import { useState, useRef, useEffect } from "react";
import { usersCache, clearUsersCache } from "@/utils/api/userApiUtils";

export const useUserCache = () => {
  // Theo dõi thời gian refresh cuối cùng để tránh refresh quá nhanh
  const lastRefreshTime = useRef(0);
  // Tăng khoảng thời gian tối thiểu giữa các lần refresh lên 5 giây
  const minRefreshInterval = 5000; // 5 giây giữa các lần refresh

  // Xóa cache khi component unmount
  useEffect(() => {
    return () => {
      clearUsersCache();
    };
  }, []);

  const checkRefreshThrottle = async () => {
    const now = Date.now();
    if (now - lastRefreshTime.current < minRefreshInterval) {
      console.log(`Hạn chế tần suất refresh: ${minRefreshInterval - (now - lastRefreshTime.current)}ms còn lại`);
      await new Promise(resolve => 
        setTimeout(resolve, minRefreshInterval - (now - lastRefreshTime.current))
      );
    }
    lastRefreshTime.current = Date.now();
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
