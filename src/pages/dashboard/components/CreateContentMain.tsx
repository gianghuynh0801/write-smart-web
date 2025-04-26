
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import ContentTabs from "./ContentTabs";
import ContentTabPanels from "./ContentTabPanels";
import PreviewDialog from "./PreviewDialog";
import ContentHeader from "./ContentHeader";
import ContentGenerateButton from "./ContentGenerateButton";
import WebhookAlert from "./WebhookAlert";
import { useContentForm } from "../hooks/useContentForm";
import { useArticleActions } from "../hooks/useArticleActions";

interface CreateContentMainProps {
  hasWebhook: boolean | null;
  isAdmin: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  isGenerating: boolean;
  editableContent: string;
  onEditableContentChange: (content: string) => void;
  openDialog: boolean;
  onOpenDialogChange: (open: boolean) => void;
}

const CreateContentMain = ({
  hasWebhook,
  isAdmin,
  isLoading,
  onSubmit,
  isGenerating,
  editableContent,
  onEditableContentChange,
  openDialog,
  onOpenDialogChange
}: CreateContentMainProps) => {
  const [activeTab, setActiveTab] = useState("keywords");
  const formState = useContentForm();
  const { isPublishing, handleSave, handlePublish } = useArticleActions();

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
        onClick={onSubmit}
        isLoading={isGenerating}
      />

      <PreviewDialog
        open={openDialog}
        onOpenChange={onOpenDialogChange}
        editableContent={editableContent}
        onEditableContentChange={onEditableContentChange}
        mainKeyword={formState.mainKeyword}
        onSave={() => handleSave(editableContent, formState.mainKeyword, formState.subKeywords)}
        onPublish={() => handlePublish(editableContent, formState.mainKeyword)}
      />
    </div>
  );
};

export default CreateContentMain;
