
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

// Singleton để lưu trữ kênh realtime được chia sẻ giữa các component
const channelSingleton = {
  channel: null as ReturnType<typeof supabase.channel> | null,
  userIds: [] as (string | number)[],
  subscriberCount: 0
};

export const useRealtimeUsers = (userIds: (string | number)[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});
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

  // Thiết lập và xử lý kênh realtime chung
  useEffect(() => {
    if (userIds.length === 0) return;

    // Cập nhật danh sách userIds trong singleton
    channelSingleton.userIds = Array.from(new Set([...channelSingleton.userIds, ...userIds]));
    channelSingleton.subscriberCount++;
    
    // Nếu chưa có kênh, tạo kênh mới
    if (!channelSingleton.channel) {
      console.log("[useRealtimeUsers] Tạo kênh realtime mới cho credits");
      
      const channel = supabase
        .channel('shared-user-credits-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=in.(${channelSingleton.userIds.join(',')})`
          },
          (payload) => {
            const newData = payload.new as { id: string | number; credits?: number; status?: string; role?: string };
            
            if (newData && typeof newData.id !== 'undefined') {
              // Chỉ cập nhật các trường cần thiết cho UI
              const updates: Partial<User> = {};
              if (typeof newData.credits !== 'undefined') updates.credits = newData.credits;
              if (typeof newData.status !== 'undefined') updates.status = newData.status as any;
              if (typeof newData.role !== 'undefined') updates.role = newData.role as any;
              
              if (Object.keys(updates).length > 0) {
                console.log("[useRealtimeUsers] Nhận thay đổi realtime cho credits/status của user:", newData.id);
                debouncedUpdateUser(newData.id, updates);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("[useRealtimeUsers] Trạng thái đăng ký kênh realtime chung:", status);
        });
        
      channelSingleton.channel = channel;
    }

    // Cleanup khi component unmount
    return () => {
      // Xóa tất cả timeout
      Object.values(updateTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Giảm số lượng subscriber
      channelSingleton.subscriberCount--;
      
      // Nếu không còn subscriber nào, hủy kênh và reset singleton
      if (channelSingleton.subscriberCount === 0 && channelSingleton.channel) {
        console.log("[useRealtimeUsers] Hủy kênh realtime chung vì không còn subscriber");
        supabase.removeChannel(channelSingleton.channel);
        channelSingleton.channel = null;
        channelSingleton.userIds = [];
      }
    };
  }, [userIds.length]); // Chỉ phụ thuộc vào độ dài của danh sách

  return realtimeUsers;
};
