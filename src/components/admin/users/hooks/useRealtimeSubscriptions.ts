
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (userIds: (string | number)[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const updateTimeoutsRef = useRef<Record<string | number, NodeJS.Timeout>>({});
  const pendingUpdatesRef = useRef<Set<string | number>>(new Set());
  const fetchTimeoutsRef = useRef<Record<string | number, NodeJS.Timeout>>({});
  
  // Debounced update function
  const debouncedUpdateUser = (userId: string | number, data: Partial<User>) => {
    // Xóa timeout cũ nếu có
    if (updateTimeoutsRef.current[userId]) {
      clearTimeout(updateTimeoutsRef.current[userId]);
    }
    
    // Tạo timeout mới để cập nhật sau 100ms
    updateTimeoutsRef.current[userId] = setTimeout(() => {
      setRealtimeUsers(prev => ({
        ...prev,
        [userId]: { ...(prev[userId] || {}), ...data } as User
      }));
      
      delete updateTimeoutsRef.current[userId];
    }, 100);
  };

  // Hàm fetch thông tin subscription với hỗ trợ bộ nhớ đệm
  const fetchSubscriptionInfo = async (userId: string | number, subscriptionId: number) => {
    try {
      // Nếu đã có request đang chờ xử lý cho user này, bỏ qua
      if (pendingUpdatesRef.current.has(`${userId}-${subscriptionId}`)) {
        return;
      }
      
      pendingUpdatesRef.current.add(`${userId}-${subscriptionId}`);
      
      // Sử dụng bộ nhớ đệm session cho thông tin subscription
      const cacheKey = `subscription-${subscriptionId}`;
      let subscriptionData = null;
      
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          subscriptionData = JSON.parse(cachedData);
          console.log("[useRealtimeSubscriptions] Sử dụng dữ liệu cache cho gói đăng ký:", subscriptionId);
        } catch (error) {
          console.error("[useRealtimeSubscriptions] Lỗi khi parse dữ liệu cache:", error);
        }
      }
      
      if (!subscriptionData) {
        console.log("[useRealtimeSubscriptions] Đang lấy thông tin gói đăng ký:", subscriptionId);
        
        const { data: fetchedData, error } = await supabase
          .from('subscriptions')
          .select('name')
          .eq('id', subscriptionId)
          .single();
          
        if (error) {
          console.error("[useRealtimeSubscriptions] Lỗi khi lấy thông tin gói đăng ký:", error);
          pendingUpdatesRef.current.delete(`${userId}-${subscriptionId}`);
          return;
        }
        
        subscriptionData = fetchedData;
        
        // Lưu vào cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(subscriptionData));
        } catch (error) {
          console.error("[useRealtimeSubscriptions] Lỗi khi lưu cache:", error);
        }
      }
      
      if (subscriptionData) {
        console.log("[useRealtimeSubscriptions] Cập nhật thông tin gói đăng ký cho user:", userId);
        debouncedUpdateUser(userId, { subscription: subscriptionData.name });
      }
    } catch (error) {
      console.error("[useRealtimeSubscriptions] Lỗi khi cập nhật thông tin gói đăng ký:", error);
    } finally {
      pendingUpdatesRef.current.delete(`${userId}-${subscriptionId}`);
    }
  };

  useEffect(() => {
    if (userIds.length === 0) return;
    
    console.log("[useRealtimeSubscriptions] Thiết lập theo dõi realtime cho gói đăng ký của", userIds.length, "người dùng");
    
    // Hủy kênh cũ nếu có
    if (channelRef.current) {
      console.log("[useRealtimeSubscriptions] Hủy kênh realtime cũ");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channel = supabase
      .channel('subscription-changes-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        async (payload) => {
          const newData = payload.new as { user_id?: string | number; subscription_id?: number };
          
          if (newData && typeof newData.user_id !== 'undefined' && 
              userIds.includes(newData.user_id) && 
              typeof newData.subscription_id !== 'undefined') {
                
            const userId = newData.user_id;
            const subscriptionId = newData.subscription_id;
            
            console.log("[useRealtimeSubscriptions] Nhận thay đổi realtime cho gói đăng ký:", 
              { userId, subscriptionId });
            
            // Kiểm tra nếu đã có timeout cho user này, hủy bỏ
            if (fetchTimeoutsRef.current[userId]) {
              clearTimeout(fetchTimeoutsRef.current[userId]);
            }
            
            // Tạo timeout mới để tránh nhiều request liên tiếp
            fetchTimeoutsRef.current[userId] = setTimeout(() => {
              fetchSubscriptionInfo(userId, subscriptionId);
              delete fetchTimeoutsRef.current[userId];
            }, 200);
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealtimeSubscriptions] Trạng thái đăng ký realtime cho gói đăng ký:", status);
      });
      
    channelRef.current = channel;

    // Cleanup khi component unmount
    return () => {
      console.log("[useRealtimeSubscriptions] Hủy đăng ký realtime cho gói đăng ký");
      
      // Xóa tất cả timeout
      Object.values(updateTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      Object.values(fetchTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userIds.join(',')]); // Chỉ phụ thuộc vào danh sách ID, không phải toàn bộ đối tượng

  return realtimeUsers;
};
