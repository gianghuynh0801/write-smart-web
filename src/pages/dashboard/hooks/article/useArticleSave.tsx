
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkUserCredits, deductCredits, getArticleCost } from "@/services/creditService";
import { useNavigate } from "react-router-dom";
import { useArticleValidation } from "./useArticleValidation";

export const useArticleSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { validateArticleContent } = useArticleValidation();

  const handleSave = async (editableContent: string, mainKeyword: string, subKeywords: string[]) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      console.log("=== Bắt đầu lưu bài viết ===");
      
      // Kiểm tra user đang đăng nhập
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Lỗi khi lấy thông tin người dùng:", userError);
        toast({
          title: "Lỗi xác thực",
          description: "Không thể xác thực người dùng. Vui lòng đăng nhập lại.",
          variant: "destructive"
        });
        return null;
      }
      
      if (!user) {
        console.error("Người dùng chưa đăng nhập");
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để lưu bài viết.",
          variant: "destructive"
        });
        return null;
      }

      // Kiểm tra nội dung bài viết
      const validationResult = validateArticleContent(editableContent, mainKeyword);
      if (!validationResult.isValid) {
        toast({
          title: "Kiểm tra bài viết",
          description: validationResult.message || "Nội dung bài viết chưa đạt yêu cầu.",
          variant: "destructive"
        });
        return null;
      }

      // Lấy chi phí bài viết
      console.log("Đang lấy chi phí bài viết...");
      const articleCost = await getArticleCost();
      console.log("Chi phí bài viết:", articleCost);
      
      if (typeof articleCost !== 'number') {
        console.error("Lỗi: Không thể đọc chi phí bài viết", articleCost);
        toast({
          title: "Lỗi hệ thống",
          description: "Không thể xác định chi phí bài viết. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        return null;
      }

      // Kiểm tra số dư tín dụng
      console.log("Đang kiểm tra số dư tín dụng...");
      try {
        const userCredits = await checkUserCredits(user.id);
        console.log("Số dư hiện tại:", userCredits, "Cần:", articleCost);
        
        if (userCredits < articleCost) {
          toast({
            title: "Không đủ tín dụng",
            description: `Bạn cần ${articleCost} tín dụng để lưu bài viết. Số dư hiện tại: ${userCredits} tín dụng.`,
            variant: "destructive",
            action: (
              <button 
                className="bg-primary text-white px-2 py-1 rounded hover:bg-primary/80 text-xs"
                onClick={() => navigate('/dashboard/subscriptions')}
              >
                Nâng cấp ngay
              </button>
            ),
          });
          return null;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra số dư tín dụng:", error);
        toast({
          title: "Lỗi kiểm tra tín dụng",
          description: error instanceof Error 
            ? error.message 
            : "Không thể kiểm tra số dư tín dụng. Vui lòng thử lại sau.",
          variant: "destructive",
          action: (
            <button 
              className="bg-primary text-white px-2 py-1 rounded hover:bg-primary/80 text-xs"
              onClick={() => navigate('/dashboard/subscriptions')}
            >
              Nâng cấp ngay
            </button>
          ),
        });
        return null;
      }

      // Lưu bài viết vào database
      console.log("Bắt đầu lưu bài viết vào database...");
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert([{
          user_id: user.id,
          content: editableContent,
          title: mainKeyword,
          keywords: [mainKeyword, ...subKeywords],
          status: 'draft'
        }])
        .select()
        .maybeSingle();

      if (articleError) {
        console.error("Lỗi khi lưu bài viết:", articleError);
        toast({
          title: "Lỗi lưu bài viết",
          description: articleError.message || "Không thể lưu bài viết. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        return null;
      }

      if (!article) {
        console.error("Không nhận được dữ liệu bài viết sau khi lưu");
        toast({
          title: "Lỗi lưu bài viết",
          description: "Không thể hoàn tất việc lưu bài viết. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        return null;
      }

      // Trừ tín dụng
      console.log("Đã lưu bài viết, bắt đầu trừ tín dụng...");
      const deducted = await deductCredits(user.id, articleCost, `Tạo bài viết: ${mainKeyword}`);

      if (!deducted) {
        console.error("Không thể trừ tín dụng cho bài viết");
        toast({
          title: "Đã lưu bài viết",
          description: "Bài viết đã được lưu nhưng có lỗi khi trừ tín dụng.",
          variant: "default"
        });
      } else {
        toast({
          title: "Đã lưu bài viết",
          description: `Đã trừ ${articleCost} tín dụng cho bài viết này.`,
        });
      }

      return article;

    } catch (error) {
      console.error('Lỗi chi tiết khi lưu bài:', error);
      toast({
        title: "Lỗi khi lưu bài viết",
        description: error instanceof Error ? error.message : "Không thể lưu bài viết. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave
  };
};
