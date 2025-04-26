
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ArticleCostCard = () => {
  const [cost, setCost] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('article_cost')
        .update({ cost })
        .eq('id', (await supabase.from('article_cost').select('id').single()).data?.id);

      if (error) throw error;

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
