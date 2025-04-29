
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ArticleCostCard = () => {
  const [cost, setCost] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Tải cấu hình hiện tại khi component được mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("system_configurations")
          .select("value")
          .eq("key", "article_cost")
          .single();
          
        if (error) {
          console.error("Lỗi khi tải cấu hình chi phí bài viết:", error);
          return;
        }
        
        if (data) {
          setCost(data.value);
        }
      } catch (error) {
        console.error("Lỗi không xác định khi tải cấu hình:", error);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Kiểm tra xem cấu hình đã tồn tại chưa
      const { data, error: selectError } = await supabase
        .from("system_configurations")
        .select("id")
        .eq("key", "article_cost")
        .maybeSingle();
      
      if (selectError) {
        console.error("Lỗi khi kiểm tra cấu hình:", selectError);
        toast({
          title: "Lỗi",
          description: "Không thể kiểm tra cấu hình hiện tại",
          variant: "destructive",
        });
        return;
      }
      
      let result;
      
      if (data) {
        // Cập nhật cấu hình hiện có
        result = await supabase
          .from("system_configurations")
          .update({ value: cost })
          .eq("id", data.id);
      } else {
        // Thêm cấu hình mới
        result = await supabase
          .from("system_configurations")
          .insert([{ key: "article_cost", value: cost }]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật chi phí tín dụng cho mỗi bài viết",
      });
    } catch (error: any) {
      console.error("Lỗi khi lưu cấu hình:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu cấu hình",
        variant: "destructive",
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
          Đặt số tín dụng tiêu thụ cho mỗi bài viết được tạo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="1"
            step="1"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">tín dụng</span>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </CardContent>
    </Card>
  );
};
