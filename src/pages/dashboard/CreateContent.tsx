
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useContentGeneration } from "./hooks/useContentGeneration";
import { useWebhookCheck } from "./hooks/useWebhookCheck";
import CreateContentMain from "./components/CreateContentMain";
import { useContentForm } from "./hooks/useContentForm";

const CreateContent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  
  const { toast } = useToast();
  const { isGenerating, generateContent } = useContentGeneration();
  const { hasWebhook, isAdmin, isLoading } = useWebhookCheck();
  const formState = useContentForm();

  const handleSubmit = () => {
    if (!formState.mainKeyword.trim()) {
      toast({
        title: "Thiếu từ khóa chính",
        description: "Vui lòng nhập từ khóa chính.",
        variant: "destructive",
      });
      return;
    }

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
      mainKeyword: formState.mainKeyword,
      subKeywords: formState.subKeywords,
      relatedKeywords: formState.relatedKeywords,
      outlineItems: formState.outlineItems,
      webConnection: formState.webConnection,
      reference: formState.reference,
      bold: formState.bold,
      italic: formState.italic,
      useList: formState.useList,
      links: formState.links,
      imageSize: formState.imageSize,
      language: formState.language,
      country: formState.country,
      tone: formState.tone,
      narrator: formState.narrator,
      formality: formState.formality
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
      {...formState}
    />
  );
};

export default CreateContent;
