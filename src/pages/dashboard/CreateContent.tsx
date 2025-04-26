
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useContentGeneration } from "./hooks/useContentGeneration";
import { useWebhookCheck } from "./hooks/useWebhookCheck";
import CreateContentMain from "./components/CreateContentMain";

const CreateContent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  
  const { toast } = useToast();
  const { isGenerating, generateContent } = useContentGeneration();
  const { hasWebhook, isAdmin, isLoading } = useWebhookCheck();

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
      mainKeyword: "",
      subKeywords: [],
      relatedKeywords: [],
      outlineItems: [],
      webConnection: true,
      reference: "",
      bold: true,
      italic: true,
      useList: true,
      links: [],
      imageSize: "medium",
    });

    if (content) {
      setEditableContent(content);
      setOpenDialog(true);
    }
  };

  return (
    <CreateContentMain 
      hasWebhook={hasWebhook}
      isAdmin={isAdmin}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      isGenerating={isGenerating}
      editableContent={editableContent}
      onEditableContentChange={setEditableContent}
      openDialog={openDialog}
      onOpenDialogChange={setOpenDialog}
    />
  );
};

export default CreateContent;
