
import { useState, useCallback } from "react";

export const useUserPagination = (isMounted: React.MutableRefObject<boolean>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Cố định pageSize

  const handlePageChange = useCallback((page: number) => {
    if (isMounted.current) {
      setCurrentPage(page);
    }
  }, []);

  const resetPage = useCallback(() => {
    if (isMounted.current) {
      setCurrentPage(1);
    }
  }, []);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageChange,
    resetPage
  };
};
