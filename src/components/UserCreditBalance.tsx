
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

export const UserCreditBalance = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      try {
        // Lấy thông tin người dùng hiện tại
        const authResponse = await supabase.auth.getUser();
        const user = authResponse.data.user;
        
        if (!user) {
          console.log("Người dùng chưa đăng nhập");
          return;
        }
        
        setUserId(user.id);
        
        // Lấy số credit của người dùng
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Lỗi khi lấy thông tin credit:", error);
          return;
        }
        
        if (data) {
          setCredits(data.credits);
          console.log("Đã lấy số dư credit:", data.credits);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra người dùng:", err);
      }
    };

    fetchUserAndCredits();

    // Đăng ký theo dõi thay đổi khi có ID người dùng
    const setupRealtimeSubscription = async () => {
      // Lấy userId từ session hiện tại
      const { data: { user } } = await supabase.auth.getUser();
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
          (payload) => {
            console.log("Nhận thông tin credit mới:", payload.new.credits);
            setCredits(payload.new.credits);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
    
  }, []);

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium">{credits} credit</span>
    </div>
  );
};
