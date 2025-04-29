
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

// Singleton để lưu trữ kênh realtime được chia sẻ giữa các component
const channelSingleton = {
  channel: null as ReturnType<typeof supabase.channel> | null,
  userIds: [] as (string | number)[],
  subscriberCount: 0
};

// Cache cho subscription
const subscriptionCache: Record<number, { name: string; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 phút

export const useRealtimeSubscriptions = (userIds: (string | number)[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});
  const updateTimeoutsRef = useRef<Record<string | number, NodeJS.Timeout>>({});
  const pendingUpdatesRef = useRef<Set<string>>>(new Set());
  const isMountedRef = useRef<boolean>(true);

  // Debounced update function
  const debouncedUpdateUser = (userId: string | number, data: Partial<User>) => {
    if (!isMountedRef.current) return;

    // Xóa timeout cũ nếu có
    if (updateTimeoutsRef.current[userId]) {
      clearTimeout(updateTimeoutsRef.current[userId]);
    }
    
    // Tạo timeout mới để cập nhật sau 100ms
    updateTimeoutsRef.current[userId] = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      setRealtimeUsers(prev => ({
        ...prev,
        [userId]: { ...(prev[userId] || {}), ...data } as User
      }));
      
      delete updateTimeoutsRef.current[userId];
    }, 100);
  };

  // Lấy thông tin subscription từ cache hoặc API
  const getSubscriptionName = async (subscriptionId: number) => {
    const now = Date.now();
    
    // Kiểm tra cache
    if (subscriptionCache[subscriptionId] && now - subscriptionCache[subscriptionId].timestamp < CACHE_TTL) {
      return subscriptionCache[subscriptionId].name;
    }
    
    // Nếu không có trong cache hoặc đã hết hạn, gọi API
    try {
      const key = `subscription-${subscriptionId}`;
      
      // Thử lấy từ sessionStorage trước
      const storedData = sessionStorage.getItem(key);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          subscriptionCache[subscriptionId] = { 
            name: parsedData.name,
            timestamp: now
          };
          return parsedData.name;
        } catch (error) {
          console.error("[useRealtimeSubscriptions] Lỗi khi parse dữ liệu cache:", error);
        }
      }
      
      // Nếu không có trong sessionStorage, gọi API
      const { data, error } = await supabase
        .from('subscriptions')
        .select('name')
        .eq('id', subscriptionId)
        .single();
        
      if (error || !data) {
        throw error || new Error("Không tìm thấy dữ liệu");
      }
      
      // Cập nhật cache
      subscriptionCache[subscriptionId] = {
        name: data.name,
        timestamp: now
      };
      
      // Lưu vào sessionStorage
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error("[useRealtimeSubscriptions] Lỗi khi lưu cache:", err);
      }
      
      return data.name;
    } catch (error) {
      console.error("[useRealtimeSubscriptions] Lỗi khi lấy tên gói đăng ký:", error);
      return "Không có";
    }
  };

  // Xử lý cập nhật thông tin subscription
  const handleSubscriptionChange = async (userId: string | number, subscriptionId: number) => {
    const cacheKey = `${userId}-${subscriptionId}`;
    
    // Nếu đang xử lý rồi thì bỏ qua
    if (pendingUpdatesRef.current.has(cacheKey)) return;
    
    pendingUpdatesRef.current.add(cacheKey);
    
    try {
      const subscriptionName = await getSubscriptionName(subscriptionId);
      
      if (isMountedRef.current) {
        debouncedUpdateUser(userId, { subscription: subscriptionName });
      }
    } catch (error) {
      console.error("[useRealtimeSubscriptions] Lỗi xử lý thay đổi gói đăng ký:", error);
    } finally {
      pendingUpdatesRef.current.delete(cacheKey);
    }
  };

  // Thiết lập và xử lý kênh realtime chung
  useEffect(() => {
    isMountedRef.current = true;
    
    if (userIds.length === 0) return;

    // Cập nhật danh sách userIds trong singleton
    channelSingleton.userIds = Array.from(new Set([...channelSingleton.userIds, ...userIds]));
    channelSingleton.subscriberCount++;
    
    // Nếu chưa có kênh, tạo kênh mới
    if (!channelSingleton.channel) {
      console.log("[useRealtimeSubscriptions] Tạo kênh realtime mới cho gói đăng ký");
      
      const channel = supabase
        .channel('shared-subscription-changes-channel')
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
                channelSingleton.userIds.includes(newData.user_id) && 
                typeof newData.subscription_id !== 'undefined') {
                  
              console.log("[useRealtimeSubscriptions] Nhận thay đổi realtime cho gói đăng ký:", 
                { userId: newData.user_id, subscriptionId: newData.subscription_id });
              
              // Xử lý thay đổi subscription
              handleSubscriptionChange(newData.user_id, newData.subscription_id);
            }
          }
        )
        .subscribe((status) => {
          console.log("[useRealtimeSubscriptions] Trạng thái đăng ký kênh realtime chung:", status);
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
        console.log("[useRealtimeSubscriptions] Hủy kênh realtime chung vì không còn subscriber");
        supabase.removeChannel(channelSingleton.channel);
        channelSingleton.channel = null;
        channelSingleton.userIds = [];
      }
    };
  }, [userIds.length]); // Chỉ phụ thuộc vào độ dài của danh sách

  return realtimeUsers;
};
