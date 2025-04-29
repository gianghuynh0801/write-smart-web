
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { featureFlags } from "@/config/featureFlags";

// Singleton để lưu trữ kênh realtime được chia sẻ giữa các component
const channelSingleton = {
  channel: null as ReturnType<typeof supabase.channel> | null,
  userIds: [] as (string | number)[],
  subscriberCount: 0
};

export const useRealtimeUsers = (userIds: (string | number)[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, Partial<User>>>({});
  const updateTimeoutsRef = useRef<Record<string | number, NodeJS.Timeout>>({});
  const isMountedRef = useRef<boolean>(true);
  
  // Nếu tính năng realtime bị tắt, trả về object rỗng
  if (!featureFlags.enableRealtimeUpdates) {
    return {};
  }
  
  // Debounced update cho từng user riêng biệt
  const debouncedUpdateUser = (userId: string | number, userData: Partial<User>) => {
    // Xóa timeout cũ nếu có
    if (updateTimeoutsRef.current[userId]) {
      clearTimeout(updateTimeoutsRef.current[userId]);
    }
    
    // Tạo timeout mới để cập nhật sau 300ms để giảm số lượng cập nhật
    updateTimeoutsRef.current[userId] = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      setRealtimeUsers(prev => ({
        ...prev,
        [userId]: { ...prev[userId], ...userData }
      }));
      
      delete updateTimeoutsRef.current[userId];
    }, 300);
  };

  // Thiết lập và xử lý kênh realtime chung
  useEffect(() => {
    if (!featureFlags.enableRealtimeUpdates) return; // Thoát nếu tính năng bị tắt
    
    isMountedRef.current = true;
    
    if (userIds.length === 0) return;

    // Giới hạn số lượng ID để tránh quá tải
    const limitedUserIds = userIds.slice(0, 50);

    // Cập nhật danh sách userIds trong singleton
    channelSingleton.userIds = Array.from(new Set([...channelSingleton.userIds, ...limitedUserIds]));
    channelSingleton.subscriberCount++;
    
    // Nếu chưa có kênh, tạo kênh mới
    if (!channelSingleton.channel) {
      console.log("[useRealtimeUsers] Tạo kênh realtime mới cho credits");
      
      // Tạo filter string với số lượng ID giới hạn
      const idFilter = channelSingleton.userIds.length > 0 
        ? `id=in.(${channelSingleton.userIds.slice(0, 50).join(',')})` 
        : "";
      
      const channel = supabase
        .channel('shared-user-credits-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: idFilter
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
      isMountedRef.current = false;
      
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
