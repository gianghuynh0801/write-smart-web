
import { useToast } from "@/hooks/use-toast";

export const useArticleValidation = () => {
  const { toast } = useToast();

  const validateArticleContent = (content: string, mainKeyword: string) => {
    if (!content.trim()) {
      toast({
        title: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung bài viết trước khi lưu.",
        variant: "destructive"
      });
      return { isValid: false };
    }

    if (!mainKeyword.trim()) {
      toast({
        title: "Thiếu từ khoá chính",
        description: "Vui lòng nhập từ khoá chính trước khi lưu.",
        variant: "destructive"
      });
      return { isValid: false };
    }

    return { isValid: true };
  };

  return {
    validateArticleContent
  };
};
