
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

export const UserCreditBalance = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      try {
        setIsLoading(true);
        // Lấy thông tin người dùng hiện tại
        const authResponse = await supabase.auth.getUser();
        const user = authResponse.data.user;
        
        if (!user) {
          console.log("Người dùng chưa đăng nhập");
          setIsLoading(false);
          return;
        }
        
        // Lấy số credit của người dùng
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Lỗi khi lấy thông tin credit:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setCredits(data.credits);
          console.log("Đã lấy số dư credit:", data.credits);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Lỗi khi kiểm tra người dùng:", err);
        setIsLoading(false);
      }
    };

    fetchUserAndCredits();

    // Đăng ký theo dõi thay đổi realtime cho credits
    const setupRealtimeSubscription = async () => {
      try {
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

    setupRealtimeSubscription();
    
  }, []);

  if (credits === null && isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
        <Wallet className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Đang tải...</span>
      </div>
    );
  }

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium">{credits} credit</span>
    </div>
  );
};
