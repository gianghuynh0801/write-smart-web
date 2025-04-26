
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ArticleCostCard = () => {
  const [cost, setCost] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCost = async () => {
      const { data, error } = await supabase
        .from("system_configurations")
        .select("value")
        .eq("key", "article_cost")
        .maybeSingle();

      if (!error && data) {
        setCost(parseInt(data.value) || 1);
      }
    };

    fetchCost();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Kiểm tra xem cấu hình đã tồn tại chưa
      const { data: existingConfig, error: checkError } = await supabase
        .from('system_configurations')
        .select('id')
        .eq('key', 'article_cost')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingConfig?.id) {
        // Cập nhật nếu đã tồn tại
        result = await supabase
          .from('system_configurations')
          .update({ value: cost.toString() })
          .eq('id', existingConfig.id);
      } else {
        // Thêm mới nếu chưa tồn tại
        result = await supabase
          .from('system_configurations')
          .insert([{ key: 'article_cost', value: cost.toString() }]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Đã lưu cấu hình",
        description: `Đã cập nhật giá credit cho mỗi bài viết: ${cost} credit`,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật giá:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giá credit. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi phí bài viết</CardTitle>
        <CardDescription>
          Cấu hình số credit cần thiết để tạo một bài viết mới
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              type="number"
              min="1"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            Lưu cấu hình
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
