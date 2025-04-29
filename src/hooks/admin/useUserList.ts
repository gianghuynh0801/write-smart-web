
import { useEffect } from "react";
import { useUserCache } from "./users/useUserCache";
import { useUserFetch } from "./users/useUserFetch";
import { useUserSearch } from "./users/useUserSearch";
import { useUserPagination } from "./users/useUserPagination";
import { featureFlags } from "@/config/featureFlags";

export const useUserList = () => {
  const { checkRefreshThrottle, hasCachedData, getCachedParams } = useUserCache();
  
  const { 
    searchTerm, 
    status, 
    handleSearch, 
    handleStatusChange 
  } = useUserSearch({ current: true });
  
  const { 
    currentPage, 
    pageSize, 
    handlePageChange,
    resetPage 
  } = useUserPagination({ current: true });

  // Effect để reset trang khi thay đổi searchTerm hoặc status
  useEffect(() => {
    resetPage();
  }, [searchTerm, status, resetPage]);

  // Khôi phục giá trị từ cache (nếu có) khi component được mount
  useEffect(() => {
    const cachedParams = getCachedParams();
    if (cachedParams) {
      // Các hooks đã được thiết lập để giá trị mặc định là "all" và "", 
      // nên chỉ cập nhật nếu giá trị khác
      if (cachedParams.status !== "all") {
        handleStatusChange(cachedParams.status);
      }
      if (cachedParams.searchTerm !== "") {
        handleSearch(cachedParams.searchTerm);
      }
    }
  }, []);
  
  const { 
    data,
    isLoading, 
    isError, 
    error, 
    refreshUsers,
    isMounted 
  } = useUserFetch(
    currentPage,
    pageSize,
    status,
    searchTerm,
    checkRefreshThrottle
  );

  // Loại bỏ auto-refresh khi component mount, chỉ load khi không có cache và cờ enableAutoRefresh được bật
  useEffect(() => {
    if (!hasCachedData() && featureFlags.enableAutoRefresh) {
      refreshUsers();
    }
  }, []);

  return {
    users: (data?.users ?? []),
    totalUsers: data?.total ?? 0,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : "Lỗi không xác định",
    searchTerm,
    status,
    currentPage,
    pageSize,
    refreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
  };
};
