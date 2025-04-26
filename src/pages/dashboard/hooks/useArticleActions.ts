
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkUserCredits, deductCredits, getArticleCost } from "@/services/creditService";

export const useArticleActions = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (editableContent: string, mainKeyword: string, subKeywords: string[]) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      console.log("=== Bắt đầu lưu bài viết ===");
      
      // Kiểm tra người dùng đã đăng nhập
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để lưu bài viết.",
          variant: "destructive"
        });
        return null;
      }

      // Kiểm tra nội dung bài viết
      if (!editableContent.trim()) {
        toast({
          title: "Thiếu nội dung",
          description: "Vui lòng nhập nội dung bài viết trước khi lưu.",
          variant: "destructive"
        });
        return null;
      }

      // Kiểm tra từ khoá chính
      if (!mainKeyword.trim()) {
        toast({
          title: "Thiếu từ khoá chính",
          description: "Vui lòng nhập từ khoá chính trước khi lưu.",
          variant: "destructive"
        });
        return null;
      }

      console.log("Kiểm tra tín dụng cho user:", user.id);
      
      // Lấy chi phí bài viết trước để tránh phải gọi API nhiều lần
      const articleCost = await getArticleCost();
      console.log(`Chi phí bài viết: ${articleCost}`);
      
      if (typeof articleCost !== 'number') {
        console.error("Lỗi: Không thể đọc chi phí bài viết", articleCost);
        toast({
          title: "Lỗi hệ thống",
          description: "Không thể xác định chi phí bài viết. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        return null;
      }

      try {
        // Kiểm tra số dư tín dụng
        const userCredits = await checkUserCredits(user.id);
        console.log(`Số dư tín dụng hiện tại: ${userCredits}, chi phí bài viết: ${articleCost}`);

        // Kiểm tra kỹ lưỡng số dư tín dụng
        if (typeof userCredits !== 'number') {
          console.error("Lỗi: Không thể đọc số dư tín dụng", userCredits);
          throw new Error("Không thể đọc số dư tín dụng. Vui lòng thử lại sau.");
        }

        if (userCredits < articleCost) {
          toast({
            title: "Không đủ tín dụng",
            description: `Bạn cần ${articleCost} tín dụng để lưu bài viết. Số dư hiện tại: ${userCredits} tín dụng.`,
            variant: "destructive"
          });
          return null;
        }

      } catch (creditError) {
        console.error("Lỗi khi kiểm tra tín dụng:", creditError);
        toast({
          title: "Lỗi kiểm tra tín dụng",
          description: creditError instanceof Error ? creditError.message : "Không thể kiểm tra số dư tín dụng. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        return null;
      }

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
        throw new Error(articleError.message);
      }

      console.log("Đã lưu bài viết, bắt đầu trừ tín dụng...");
      const deducted = await deductCredits(
        user.id, 
        articleCost, // Sử dụng chi phí đã lấy từ trước
        `Tạo bài viết: ${mainKeyword}`
      );

      if (!deducted) {
        console.error("Không thể trừ tín dụng cho bài viết");
        toast({
          title: "Đã lưu bài viết",
          description: "Bài viết đã được lưu nhưng có lỗi khi trừ tín dụng.",
          variant: "default"
        });
        return article;
      }

      toast({
        title: "Đã lưu bài viết",
        description: `Đã trừ ${articleCost} tín dụng cho bài viết này.`,
      });

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

  const handlePublish = async (editableContent: string, mainKeyword: string) => {
    if (isPublishing) return;
    setIsPublishing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để đăng bài viết.",
          variant: "destructive"
        });
        return;
      }

      const { error: publishError } = await supabase
        .from('articles')
        .update({ 
          status: 'published',
          content: editableContent,
          published_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('title', mainKeyword);

      if (publishError) throw publishError;

      toast({
        title: "Đã đăng bài viết",
        description: "Bài viết của bạn đã được đăng công khai.",
      });

    } catch (error) {
      console.error('Lỗi khi đăng bài:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bài viết. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    isSaving,
    handleSave,
    handlePublish
  };
};
