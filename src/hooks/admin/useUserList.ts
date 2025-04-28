
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: params
  });

  if (error) {
    console.error("Lỗi khi gọi admin-users function:", error);
    throw error;
  }

  if (data.error) {
    console.error("admin-users function trả về lỗi:", data.error);
    throw new Error(data.error);
  }

  console.log(`Đã lấy được ${data.data.users.length} người dùng, tổng số: ${data.data.total}`);
  return data.data;
};

export const useUserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refreshUsers
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, status, searchTerm],
    queryFn: () => fetchUsers({ page: currentPage, pageSize, status, searchTerm }),
    retry: 2,
    onError: (err) => {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    }
  });

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    users: (data?.users ?? []) as User[],
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
