
import { useEffect } from "react";
import { useUserCache } from "./users/useUserCache";
import { useUserFetch } from "./users/useUserFetch";
import { useUserSearch } from "./users/useUserSearch";
import { useUserPagination } from "./users/useUserPagination";

export const useUserList = () => {
  const { 
    checkRefreshThrottle, 
    hasCachedData, 
    getCachedParams,
    initialLoadDone,
    forceClearCache
  } = useUserCache();
  
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
  }, [getCachedParams, handleSearch, handleStatusChange]);
  
  const { 
    data,
    isLoading, 
    isError, 
    error, 
    refreshUsers: baseRefreshUsers,
    isMounted,
    hasInitialFetch
  } = useUserFetch(
    currentPage,
    pageSize,
    status,
    searchTerm,
    checkRefreshThrottle
  );

  // Tạo một wrapper cho refreshUsers để xử lý các trường hợp đặc biệt
  const refreshUsers = async (forceRefresh = false) => {
    console.log("[useUserList] Yêu cầu làm mới dữ liệu, forceRefresh =", forceRefresh);
    
    // Nếu yêu cầu làm mới bắt buộc, xóa cache trước
    if (forceRefresh) {
      console.log("[useUserList] Xóa cache và làm mới dữ liệu bắt buộc");
      forceClearCache();
    }
    
    try {
      return await baseRefreshUsers();
    } catch (err) {
      console.error("[useUserList] Lỗi khi làm mới dữ liệu:", err);
      return false;
    }
  };

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
    hasInitialFetch
  };
};
