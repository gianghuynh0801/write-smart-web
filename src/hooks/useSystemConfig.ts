
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useSystemConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getConfig = useCallback(async (key: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', key as any)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching config for ${key}:`, error);
        setError(`Không thể tải cấu hình: ${error.message}`);
        return null;
      }
      
      // Kiểm tra an toàn và trích xuất giá trị
      return data && typeof data === 'object' && 'value' in data ? data.value : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error(`Unexpected error getting config ${key}:`, err);
      setError(`Lỗi: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureConfigExists = useCallback(async (key: string, defaultValue: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Kiểm tra xem cấu hình đã tồn tại chưa
      const { data, error } = await supabase
        .from('system_configurations')
        .select('id')
        .eq('key', key as any)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error(`Error checking config ${key}:`, error);
        setError(`Không thể kiểm tra cấu hình: ${error.message}`);
        return;
      }
      
      // Nếu không tìm thấy, tạo mới
      if (!data) {
        console.log(`Creating new config ${key} with default value: ${defaultValue}`);
        
        const { error: insertError } = await supabase
          .from('system_configurations')
          .insert({ 
            key: key, 
            value: defaultValue 
          } as any);
        
        if (insertError) {
          console.error(`Error creating config ${key}:`, insertError);
          setError(`Không thể tạo cấu hình: ${insertError.message}`);
          return;
        }
        
        console.log(`Config ${key} created successfully`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error(`Unexpected error ensuring config ${key}:`, err);
      setError(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Updating config ${key} to: ${value}`);
      
      // Kiểm tra xem cấu hình đã tồn tại chưa
      const { data, error: checkError } = await supabase
        .from('system_configurations')
        .select('id')
        .eq('key', key as any)
        .maybeSingle();
      
      if (checkError) {
        console.error(`Error checking config ${key}:`, checkError);
        setError(`Không thể kiểm tra cấu hình: ${checkError.message}`);
        return false;
      }
      
      // Nếu tìm thấy, cập nhật
      if (data && typeof data === 'object' && 'id' in data) {
        const { error: updateError } = await supabase
          .from('system_configurations')
          .update({ value } as any)
          .eq('id', data.id as any);
        
        if (updateError) {
          console.error(`Error updating config ${key}:`, updateError);
          setError(`Không thể cập nhật cấu hình: ${updateError.message}`);
          return false;
        }
      } 
      // Nếu không tìm thấy, tạo mới
      else {
        const { error: insertError } = await supabase
          .from('system_configurations')
          .insert({ 
            key: key, 
            value: value 
          } as any);
        
        if (insertError) {
          console.error(`Error creating config ${key}:`, insertError);
          setError(`Không thể tạo cấu hình: ${insertError.message}`);
          return false;
        }
      }
      
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật cấu hình ${key}`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error(`Unexpected error updating config ${key}:`, err);
      setError(`Lỗi: ${errorMessage}`);
      
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật cấu hình: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    getConfig,
    updateConfig,
    ensureConfigExists
  };
}
