
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: number;
  name: string;
  price: number;
  period: string;
  features?: string[];
  description?: string;
}

export const useRealtimeSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo dữ liệu
  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching subscription plans...');
      const { data, error: fetchError } = await supabase
        .from('subscriptions' as any)
        .select('*')
        .order('price', { ascending: true });
      
      if (fetchError) {
        console.error('Error fetching subscriptions:', fetchError);
        setError('Không thể tải danh sách gói đăng ký');
        setSubscriptions([]);
        return;
      }
      
      // Đảm bảo luôn có gói "Không có"
      const dataArray = data || [];
      const hasNoneOption = dataArray.some(sub => {
        if (!sub) return false;
        return typeof sub === 'object' && 'name' in sub && (sub as any).name === 'Không có';
      });
      
      let processedData = [...dataArray];
      
      if (!hasNoneOption) {
        const noneOption = {
          id: -1,
          name: 'Không có',
          price: 0,
          period: 'month',
          description: 'Không sử dụng gói đăng ký',
          features: []
        };
        processedData.unshift(noneOption as any);
      }
      
      // Đảm bảo dữ liệu hợp lệ
      const validSubscriptions = processedData.map(sub => {
        // Nếu là null hoặc không phải object
        if (!sub || typeof sub !== 'object') {
          return {
            id: -999,
            name: 'Lỗi dữ liệu',
            price: 0,
            period: 'month',
            features: []
          };
        }
        
        // Xử lý features nếu có
        let features: string[] = [];
        if ('features' in sub && (sub as any).features) {
          try {
            if (Array.isArray((sub as any).features)) {
              features = (sub as any).features;
            } else if (typeof (sub as any).features === 'string') {
              features = JSON.parse((sub as any).features);
            }
          } catch (e) {
            console.warn('Error parsing features for subscription:', (sub as any).id, e);
          }
        }
        
        return {
          id: 'id' in sub ? Number((sub as any).id) : -999,
          name: 'name' in sub ? String((sub as any).name) : 'Không xác định',
          price: 'price' in sub ? Number((sub as any).price) : 0,
          period: 'period' in sub ? String((sub as any).period) : 'month',
          description: 'description' in sub ? String((sub as any).description) : '',
          features
        };
      });
      
      setSubscriptions(validSubscriptions);
      console.log('Subscription plans loaded:', validSubscriptions.length);
    } catch (error) {
      console.error('Unexpected error in fetchSubscriptions:', error);
      setError('Lỗi không xác định khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Lấy thông tin gói đăng ký theo ID
  const getSubscriptionById = useCallback(async (id: number): Promise<Subscription | null> => {
    try {
      const cached = subscriptions.find(sub => sub.id === id);
      if (cached) return cached;
      
      console.log(`Fetching subscription with ID ${id}...`);
      const { data, error } = await supabase
        .from('subscriptions' as any)
        .select('*')
        .eq('id', id as any)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching subscription ${id}:`, error);
        return null;
      }
      
      if (!data) return null;
      
      // Kiểm tra và truy cập an toàn
      const sub = data as any;

      const name = sub && typeof sub === 'object' && 'name' in sub ? 
        String(sub.name) : 'Không xác định';
        
      const price = sub && typeof sub === 'object' && 'price' in sub ? 
        Number(sub.price) : 0;
        
      const period = sub && typeof sub === 'object' && 'period' in sub ? 
        String(sub.period) : 'month';
      
      const description = sub && typeof sub === 'object' && 'description' in sub ? 
        String(sub.description) : '';
      
      let features: string[] = [];
      if (sub && typeof sub === 'object' && 'features' in sub && sub.features) {
        try {
          if (Array.isArray(sub.features)) {
            features = sub.features;
          } else if (typeof sub.features === 'string') {
            features = JSON.parse(sub.features);
          }
        } catch (e) {
          console.warn(`Error parsing features for subscription ${id}:`, e);
        }
      }
      
      return {
        id,
        name,
        price,
        period,
        description,
        features
      };
    } catch (error) {
      console.error(`Unexpected error getting subscription ${id}:`, error);
      return null;
    }
  }, [subscriptions]);
  
  // Lấy tên gói đăng ký theo ID
  const getSubscriptionNameById = useCallback(async (id: number): Promise<string> => {
    if (id === -1 || id === 0) return "Không có";
    
    const cached = subscriptions.find(sub => sub.id === id);
    if (cached) return cached.name;
    
    const subscription = await getSubscriptionById(id);
    return subscription?.name || "Không xác định";
  }, [subscriptions, getSubscriptionById]);
  
  // Lắng nghe thay đổi trong realtime
  useEffect(() => {
    fetchSubscriptions();
    
    // Thiết lập channel realtime để theo dõi thay đổi
    const subscriptionsChannel = supabase
      .channel('subscriptions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => {
          console.log('Subscription data changed, reloading...');
          fetchSubscriptions();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [fetchSubscriptions]);
  
  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    getSubscriptionById,
    getSubscriptionNameById
  };
};
