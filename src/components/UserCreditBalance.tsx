
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';

export const UserCreditBalance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, userDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  useEffect(() => {
    const loadUserCredits = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Nếu userDetails đã có credits thì sử dụng luôn
      if (userDetails?.credits !== undefined) {
        setIsLoading(false);
        return;
      }
      
      try {
        await refreshUserData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserCredits();
    
    // Đăng ký theo dõi thay đổi realtime cho tín dụng
    const setupRealtimeSubscription = async () => {
      try {
        if (!user) return;
        
        console.log("Thiết lập theo dõi realtime cho user:", user.id);
        
        const channel = supabase
          .channel('user-credits-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`
            },
            async (payload) => {
              console.log("Nhận thông tin tín dụng mới:", payload.new.credits);
              // Refresh toàn bộ dữ liệu người dùng thay vì chỉ cập nhật credits
              await refreshUserData();
            }
          )
          .subscribe((status) => {
            console.log("Trạng thái kết nối realtime:", status);
          });

        return () => {
          console.log("Hủy theo dõi realtime");
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Lỗi khi thiết lập kết nối realtime:", error);
      }
    };

    const unsubscribe = setupRealtimeSubscription();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user, userDetails, refreshUserData]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
        <Wallet className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Đang tải...</span>
      </div>
    );
  }

  // Hiển thị số tín dụng từ userDetails hoặc 0 nếu không có
  const credits = userDetails?.credits !== undefined ? userDetails.credits : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium">{credits} tín dụng</span>
    </div>
  );
};
