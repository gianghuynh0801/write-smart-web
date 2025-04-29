
import { useState, useCallback } from "react";

// Thêm debounce helper function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = null;
    }, wait);
  };
}

export const useUserSearch = (isMounted: React.MutableRefObject<boolean>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  // Debounced search term setter với thời gian dài hơn
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      if (isMounted.current) {
        setSearchTerm(value);
      }
    }, 1000), // 1 giây để giảm số lượng request
    []
  );

  const handleSearch = useCallback((value: string) => {
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  const handleStatusChange = useCallback((value: string) => {
    if (isMounted.current) {
      setStatus(value);
    }
  }, []);

  return {
    searchTerm,
    status,
    handleSearch,
    handleStatusChange
  };
};
