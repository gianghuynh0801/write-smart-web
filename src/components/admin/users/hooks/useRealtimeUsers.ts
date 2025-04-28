
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUsers = (users: User[]) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});

  useEffect(() => {
    console.log("[useRealtimeUsers] Thiết lập theo dõi realtime cho người dùng");
    
    const channel = supabase
      .channel('user-credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log("[useRealtimeUsers] Nhận thay đổi realtime cho người dùng:", payload.new);
          
          const newData = payload.new as { id: string | number; [key: string]: any };
          
          if (newData && typeof newData.id !== 'undefined') {
            setRealtimeUsers(prev => ({
              ...prev,
              [newData.id]: {
                ...(users.find(u => u.id === newData.id) || {}),
                ...newData
              } as User
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealtimeUsers] Trạng thái đăng ký realtime:", status);
      });

    return () => {
      console.log("[useRealtimeUsers] Hủy đăng ký realtime");
      supabase.removeChannel(channel);
    };
  }, [users]);

  return realtimeUsers;
};
