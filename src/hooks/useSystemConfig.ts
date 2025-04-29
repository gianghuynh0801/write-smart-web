
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSystemConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm để đảm bảo cấu hình tồn tại
  const ensureConfigExists = async (key: string, defaultValue: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Kiểm tra xem cấu hình đã tồn tại chưa
      const { data, error: fetchError } = await supabase
        .from('system_configurations')
        .select('*')
        .eq('key', key)
        .maybeSingle();
      
      if (fetchError) {
        console.error(`Lỗi khi kiểm tra cấu hình ${key}:`, fetchError);
        setError(fetchError.message);
        return false;
      }
      
      // Nếu cấu hình chưa tồn tại, thêm mới
      if (!data) {
        const { error: insertError } = await supabase
          .from('system_configurations')
          .insert([{ key, value: defaultValue }]);
        
        if (insertError) {
          console.error(`Lỗi khi thêm cấu hình ${key}:`, insertError);
          setError(insertError.message);
          return false;
        }
        
        console.log(`Đã thêm cấu hình ${key}=${defaultValue}`);
        return true;
      }
      
      console.log(`Cấu hình ${key} đã tồn tại: ${data.value}`);
      return true;
    } catch (error: any) {
      console.error(`Lỗi không xác định khi quản lý cấu hình ${key}:`, error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hàm để cập nhật cấu hình
  const updateConfig = async (key: string, value: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Kiểm tra xem cấu hình đã tồn tại chưa và lấy id
      const { data, error: fetchError } = await supabase
        .from('system_configurations')
        .select('id')
        .eq('key', key)
        .maybeSingle();
      
      if (fetchError) {
        console.error(`Lỗi khi kiểm tra cấu hình ${key}:`, fetchError);
        setError(fetchError.message);
        return false;
      }
      
      if (data) {
        // Nếu đã tồn tại thì cập nhật
        const { error: updateError } = await supabase
          .from('system_configurations')
          .update({ value })
          .eq('id', data.id);
        
        if (updateError) {
          console.error(`Lỗi khi cập nhật cấu hình ${key}:`, updateError);
          setError(updateError.message);
          return false;
        }
      } else {
        // Nếu chưa tồn tại thì thêm mới
        const { error: insertError } = await supabase
          .from('system_configurations')
          .insert([{ key, value }]);
        
        if (insertError) {
          console.error(`Lỗi khi thêm cấu hình ${key}:`, insertError);
          setError(insertError.message);
          return false;
        }
      }
      
      console.log(`Cấu hình ${key} đã được cập nhật thành ${value}`);
      return true;
    } catch (error: any) {
      console.error(`Lỗi không xác định khi cập nhật cấu hình ${key}:`, error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm để lấy giá trị cấu hình
  const getConfigValue = async (key: string, defaultValue: string = '') => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      if (error || !data) {
        console.error(`Lỗi khi lấy cấu hình ${key}:`, error);
        return defaultValue;
      }
      
      return data.value;
    } catch (error) {
      console.error(`Lỗi không xác định khi lấy cấu hình ${key}:`, error);
      return defaultValue;
    }
  };

  return {
    isLoading,
    error,
    ensureConfigExists,
    updateConfig,
    getConfigValue
  };
}
