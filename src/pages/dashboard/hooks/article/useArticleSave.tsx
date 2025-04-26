
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
      
      const user = await validateUser();
      if (!user) return null;

      const validationResult = validateArticleContent(editableContent, mainKeyword);
      if (!validationResult.isValid) return null;

      const articleCost = await getArticleCost();
      if (!await validateArticleCost(articleCost, user.id)) return null;

      const article = await saveArticleToDatabase(user.id, editableContent, mainKeyword, subKeywords);
      if (!article) return null;

      const deducted = await deductArticleCredits(user.id, articleCost, mainKeyword);
      
      showSuccessToast(articleCost);
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

  const validateUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để lưu bài viết.",
        variant: "destructive"
      });
      return null;
    }
    return user;
  };

  const validateArticleCost = async (articleCost: number | undefined, userId: string) => {
    if (typeof articleCost !== 'number') {
      console.error("Lỗi: Không thể đọc chi phí bài viết", articleCost);
      toast({
        title: "Lỗi hệ thống",
        description: "Không thể xác định chi phí bài viết. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const userCredits = await checkUserCredits(userId);
      if (typeof userCredits !== 'number') {
        throw new Error("Không thể đọc số dư tín dụng.");
      }

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
        return false;
      }

      return true;
    } catch (error) {
      console.error("Lỗi khi kiểm tra tín dụng:", error);
      toast({
        title: "Lỗi kiểm tra tín dụng",
        description: error instanceof Error ? error.message : "Không thể kiểm tra số dư tín dụng. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveArticleToDatabase = async (userId: string, content: string, title: string, keywords: string[]) => {
    console.log("Bắt đầu lưu bài viết vào database...");
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert([{
        user_id: userId,
        content: content,
        title: title,
        keywords: [title, ...keywords],
        status: 'draft'
      }])
      .select()
      .maybeSingle();

    if (articleError) {
      console.error("Lỗi khi lưu bài viết:", articleError);
      throw new Error(articleError.message);
    }

    return article;
  };

  const deductArticleCredits = async (userId: string, cost: number, title: string) => {
    console.log("Đã lưu bài viết, bắt đầu trừ tín dụng...");
    const deducted = await deductCredits(userId, cost, `Tạo bài viết: ${title}`);

    if (!deducted) {
      console.error("Không thể trừ tín dụng cho bài viết");
      toast({
        title: "Đã lưu bài viết",
        description: "Bài viết đã được lưu nhưng có lỗi khi trừ tín dụng.",
        variant: "default"
      });
    }
    return deducted;
  };

  const showSuccessToast = (cost: number) => {
    toast({
      title: "Đã lưu bài viết",
      description: `Đã trừ ${cost} tín dụng cho bài viết này.`,
    });
  };

  return {
    isSaving,
    handleSave
  };
};
