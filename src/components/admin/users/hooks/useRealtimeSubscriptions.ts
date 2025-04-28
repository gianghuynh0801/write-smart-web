
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (users: User[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});

  useEffect(() => {
    console.log("[useRealtimeSubscriptions] Thiết lập theo dõi realtime cho gói đăng ký");
    
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        async (payload) => {
          console.log("[useRealtimeSubscriptions] Nhận thay đổi realtime cho gói đăng ký:", payload);
          
          const newData = payload.new as { user_id?: string | number; subscription_id?: number };
          
          if (newData && typeof newData.user_id !== 'undefined') {
            const userId = newData.user_id;
            const userToUpdate = users.find(u => u.id === userId);
            
            if (userToUpdate) {
              try {
                console.log("[useRealtimeSubscriptions] Đang cập nhật thông tin gói đăng ký cho user:", userId);
                
                if (typeof newData.subscription_id !== 'undefined') {
                  const { data: subscriptionData } = await supabase
                    .from('subscriptions')
                    .select('name')
                    .eq('id', newData.subscription_id)
                    .single();
                    
                  if (subscriptionData) {
                    console.log("[useRealtimeSubscriptions] Đã tìm thấy gói đăng ký:", subscriptionData.name);
                    
                    setRealtimeUsers(prev => ({
                      ...prev,
                      [userId]: {
                        ...(prev[userId] || userToUpdate),
                        subscription: subscriptionData.name
                      }
                    }));
                  }
                }
              } catch (error) {
                console.error("[useRealtimeSubscriptions] Lỗi khi cập nhật thông tin gói đăng ký:", error);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealtimeSubscriptions] Trạng thái đăng ký realtime cho gói đăng ký:", status);
      });

    return () => {
      console.log("[useRealtimeSubscriptions] Hủy đăng ký realtime cho gói đăng ký");
      supabase.removeChannel(channel);
    };
  }, [users]);

  return realtimeUsers;
};
