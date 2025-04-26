
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useArticlePublish = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

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
    handlePublish
  };
};
