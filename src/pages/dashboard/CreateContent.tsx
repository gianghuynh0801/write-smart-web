import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import ContentTabs from "./components/ContentTabs";
import ContentTabPanels from "./components/ContentTabPanels";
import PreviewDialog from "./components/PreviewDialog";
import ContentHeader from "./components/ContentHeader";
import ContentGenerateButton from "./components/ContentGenerateButton";
import { useContentGeneration } from "./hooks/useContentGeneration";
import { useToast } from "@/hooks/use-toast";
import WebhookAlert from "./components/WebhookAlert";
import { useWebhookCheck } from "./hooks/useWebhookCheck";
import { useContentForm } from "./hooks/useContentForm";
import { supabase } from "@/integrations/supabase/client";
import { checkUserCredits, deductCredits, getArticleCost } from "@/services/creditService";

const CreateContent = () => {
  const [activeTab, setActiveTab] = useState("keywords");
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { toast } = useToast();
  const { isGenerating, generateContent } = useContentGeneration();
  const { hasWebhook, isAdmin, isLoading } = useWebhookCheck();
  const formState = useContentForm();

  const handleSubmit = () => {
    if (hasWebhook === false) {
      toast({
        title: "Cấu hình thiếu",
        description: "Hệ thống chưa có URL webhook được cấu hình. Vui lòng liên hệ quản trị viên.",
        variant: "destructive",
      });
      return;
    }
    handleContentGeneration();
  };

  const handleContentGeneration = async () => {
    const content = await generateContent({
      ...formState,
    });

    if (content) {
      setEditableContent(content);
      setOpenDialog(true);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để lưu bài viết.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Kiểm tra credit
      const [userCredits, articleCost] = await Promise.all([
        checkUserCredits(user.id),
        getArticleCost()
      ]);

      console.log(`Kiểm tra credit: Số dư hiện tại ${userCredits}, cần ${articleCost}`);

      if (userCredits < articleCost) {
        toast({
          title: "Không đủ credit",
          description: `Bạn cần ${articleCost} credit để lưu bài viết. Số dư hiện tại: ${userCredits} credit.`,
          variant: "destructive"
        });
        return;
      }

      // Lưu bài viết
      console.log("Bắt đầu lưu bài viết...");
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert([{
          user_id: user.id,
          content: editableContent,
          title: formState.mainKeyword,
          keywords: [formState.mainKeyword, ...formState.subKeywords],
          status: 'draft'
        }])
        .select()
        .single();

      if (articleError) {
        console.error("Lỗi khi lưu bài viết:", articleError);
        throw articleError;
      }

      console.log("Đã lưu bài viết, bắt đầu trừ credit");
      // Trừ credit
      const deducted = await deductCredits(
        user.id, 
        articleCost,
        `Tạo bài viết: ${formState.mainKeyword}`
      );

      if (!deducted) {
        console.error("Không thể trừ credit cho bài viết");
        // Thay đổi variant từ "warning" sang "default"
        toast({
          title: "Đã lưu bài viết",
          description: "Bài viết đã được lưu nhưng có lỗi khi trừ credit.",
          variant: "default"
        });
        return;
      }

      setSavedContent(editableContent);
      toast({
        title: "Đã lưu bài viết",
        description: `Đã trừ ${articleCost} credit cho bài viết này.`,
      });

    } catch (error) {
      console.error('Lỗi khi lưu bài:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bài viết. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
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

      // Cập nhật trạng thái bài viết
      const { error: publishError } = await supabase
        .from('articles')
        .update({ 
          status: 'published',
          content: editableContent,
          published_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('title', formState.mainKeyword);

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

  return (
    <div className="w-full min-h-screen py-8 px-2 md:px-10 flex flex-col bg-background">
      <ContentHeader 
        title="Tạo nội dung"
        description="Tạo bài viết chuẩn SEO với công nghệ AI"
      />
      
      <WebhookAlert 
        hasWebhook={hasWebhook}
        isAdmin={isAdmin}
        isLoading={isLoading}
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <Tabs
          orientation="vertical"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col md:flex-row gap-6 relative"
        >
          <div className="md:sticky top-0 self-start">
            <ContentTabs activeTab={activeTab} />
          </div>
          <div className="flex-1">
            <ContentTabPanels
              activeTab={activeTab}
              {...formState}
            />
          </div>
        </Tabs>
      </div>

      <ContentGenerateButton 
        onClick={handleSubmit}
        isLoading={isGenerating}
      />

      <PreviewDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editableContent={editableContent}
        onEditableContentChange={setEditableContent}
        mainKeyword={formState.mainKeyword}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default CreateContent;
