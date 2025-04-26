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
        return;
      }

      // Kiểm tra nội dung bài viết
      if (!editableContent.trim()) {
        toast({
          title: "Thiếu nội dung",
          description: "Vui lòng nhập nội dung bài viết trước khi lưu.",
          variant: "destructive"
        });
        return;
      }

      // Kiểm tra từ khoá chính
      if (!mainKeyword.trim()) {
        toast({
          title: "Thiếu từ khoá chính",
          description: "Vui lòng nhập từ khoá chính trước khi lưu.",
          variant: "destructive"
        });
        return;
      }

      console.log("Kiểm tra credit cho user:", user.id);
      const [userCredits, articleCost] = await Promise.all([
        checkUserCredits(user.id),
        getArticleCost()
      ]);

      console.log(`Số dư hiện tại: ${userCredits}, chi phí bài viết: ${articleCost}`);

      if (userCredits < articleCost) {
        toast({
          title: "Không đủ credit",
          description: `Bạn cần ${articleCost} credit để lưu bài viết. Số dư hiện tại: ${userCredits} credit.`,
          variant: "destructive"
        });
        return;
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
        .single();

      if (articleError) {
        console.error("Lỗi khi lưu bài viết:", articleError);
        throw new Error(articleError.message);
      }

      console.log("Đã lưu bài viết, bắt đầu trừ credit...");
      const deducted = await deductCredits(
        user.id, 
        articleCost,
        `Tạo bài viết: ${mainKeyword}`
      );

      if (!deducted) {
        console.error("Không thể trừ credit cho bài viết");
        toast({
          title: "Đã lưu bài viết",
          description: "Bài viết đã được lưu nhưng có lỗi khi trừ credit.",
          variant: "default"
        });
        return article;
      }

      toast({
        title: "Đã lưu bài viết",
        description: `Đã trừ ${articleCost} credit cho bài viết này.`,
      });

      return article;

    } catch (error) {
      console.error('Lỗi chi tiết khi lưu bài:', error);
      toast({
        title: "Lỗi khi lưu bài viết",
        description: error instanceof Error ? error.message : "Không thể lưu bài viết. Vui lòng th�� lại sau.",
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
