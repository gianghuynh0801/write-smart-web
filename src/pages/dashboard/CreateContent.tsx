
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import ContentTabs from "./components/ContentTabs";
import ContentTabPanels from "./components/ContentTabPanels";
import PreviewDialog from "./components/PreviewDialog";
import ContentHeader from "./components/ContentHeader";
import ContentGenerateButton from "./components/ContentGenerateButton";
import { useContentGeneration } from "./hooks/useContentGeneration";
import { useToast } from "@/hooks/use-toast";
import { OutlineItem } from "./components/ContentOutline";

const CreateContent = () => {
  const [activeTab, setActiveTab] = useState("keywords");
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const { toast } = useToast();

  // State management - this state is now preserved when switching tabs
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([
    { heading: "H2", title: "" }
  ]);
  const [webConnection, setWebConnection] = useState(true);
  const [reference, setReference] = useState("");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(true);
  const [useList, setUseList] = useState(true);
  const [links, setLinks] = useState<Array<{ keyword: string; url: string }>>([
    { keyword: "", url: "" }
  ]);
  const [imageSize, setImageSize] = useState("medium");

  const { isGenerating, generateContent } = useContentGeneration();

  const handleSubmit = () => {
    handleContentGeneration();
  };

  const handleContentGeneration = async () => {
    const content = await generateContent({
      mainKeyword,
      subKeywords,
      relatedKeywords,
      outlineItems,
      webConnection,
      reference,
      bold,
      italic,
      useList,
      links,
      imageSize,
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
              mainKeyword={mainKeyword}
              setMainKeyword={setMainKeyword}
              subKeywords={subKeywords}
              setSubKeywords={setSubKeywords}
              relatedKeywords={relatedKeywords}
              setRelatedKeywords={setRelatedKeywords}
              outlineItems={outlineItems}
              setOutlineItems={setOutlineItems}
              webConnection={webConnection}
              setWebConnection={setWebConnection}
              reference={reference}
              setReference={setReference}
              bold={bold}
              setBold={setBold}
              italic={italic}
              setItalic={setItalic}
              useList={useList}
              setUseList={setUseList}
              links={links}
              setLinks={setLinks}
              imageSize={imageSize}
              setImageSize={setImageSize}
              resolution={72}
              setResolution={() => {}}
              keepAspectRatio={true}
              setKeepAspectRatio={() => {}}
              optimizeImages={true}
              setOptimizeImages={() => {}}
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
        mainKeyword={mainKeyword}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default CreateContent;
