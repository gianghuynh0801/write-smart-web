
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUsers = (userIds: (string | number)[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const updateTimeoutsRef = useRef<Record<string | number, NodeJS.Timeout>>({});
  
  // Debounced update cho từng user riêng biệt
  const debouncedUpdateUser = (userId: string | number, userData: Partial<User>) => {
    // Xóa timeout cũ nếu có
    if (updateTimeoutsRef.current[userId]) {
      clearTimeout(updateTimeoutsRef.current[userId]);
    }
    
    // Tạo timeout mới để cập nhật sau 100ms
    updateTimeoutsRef.current[userId] = setTimeout(() => {
      setRealtimeUsers(prev => ({
        ...prev,
        [userId]: { ...prev[userId], ...userData } as User
      }));
      
      delete updateTimeoutsRef.current[userId];
    }, 100);
  };

  useEffect(() => {
    if (userIds.length === 0) return;
    
    console.log("[useRealtimeUsers] Thiết lập theo dõi realtime cho", userIds.length, "người dùng");
    
    // Hủy kênh cũ nếu có
    if (channelRef.current) {
      console.log("[useRealtimeUsers] Hủy kênh realtime cũ");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Tạo kênh mới chỉ một lần
    const channel = supabase
      .channel('user-credits-changes-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          const newData = payload.new as { id: string | number; [key: string]: any };
          
          if (newData && typeof newData.id !== 'undefined' && userIds.includes(newData.id)) {
            console.log("[useRealtimeUsers] Nhận thay đổi realtime cho người dùng:", newData.id);
            debouncedUpdateUser(newData.id, newData as Partial<User>);
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealtimeUsers] Trạng thái đăng ký realtime:", status);
      });
      
    channelRef.current = channel;

    // Cleanup khi component unmount
    return () => {
      console.log("[useRealtimeUsers] Hủy đăng ký realtime");
      
      // Xóa tất cả timeout
      Object.values(updateTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userIds.join(',')]); // Chỉ phụ thuộc vào danh sách ID, không phải toàn bộ đối tượng user

  return realtimeUsers;
};
