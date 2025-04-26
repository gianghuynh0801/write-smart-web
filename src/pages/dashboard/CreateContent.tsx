
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

const CreateContent = () => {
  const [activeTab, setActiveTab] = useState("keywords");
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  
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

  const handleSave = () => {
    setSavedContent(editableContent);
    toast({
      title: "Đã lưu nháp",
      description: "Nội dung bài viết đã được lưu vào bộ nhớ tạm.",
    });
  };

  const handlePublish = () => {
    console.log("Nội dung sẽ đăng:", editableContent);
    toast({
      title: "Đăng bài viết",
      description: "Đã gửi nội dung lên hệ thống (demo - log ra console).",
    });
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
