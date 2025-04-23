
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateContent } from "@/utils/webhookService";
import ContentTabs from "./components/ContentTabs";
import ContentTabPanels from "./components/ContentTabPanels";
import PreviewDialog from "./components/PreviewDialog";
import { OutlineItem } from "./components/ContentOutline";
import { getItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

const CreateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState("keywords");
  const { toast } = useToast();

  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

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
  const [resolution, setResolution] = useState(72);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainKeyword) {
      toast({
        title: "Thiếu từ khoá chính",
        description: "Vui lòng nhập từ khoá chính.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setEditableContent("");
    try {
      const params = {
        // Keywords tab
        keywords: {
          main: mainKeyword,
          sub: subKeywords,
          related: relatedKeywords,
        },
        // Outline tab
        outline: outlineItems,
        // Knowledge panel tab
        knowledge: {
          webConnection,
          reference,
        },
        // Format tab
        format: {
          bold,
          italic,
          useList,
        },
        // Links tab
        links: links,
        // Images tab
        images: {
          size: imageSize,
        }
      };

      console.log("Gửi yêu cầu tạo nội dung với params:", params);
      
      // Lấy webhook URL từ localStorage hoặc sử dụng URL mặc định
      const webhookUrl = getItem(LOCAL_STORAGE_KEYS.WEBHOOK_URL, false) || 
        import.meta.env.VITE_N8N_WEBHOOK_URL ||
        "https://workflow.matbao.support/webhook/80808e9c-a56a-4b4f-83da-7710fae0bda7";
      
      const resp = await generateContent(params, webhookUrl);
      
      if (resp.status === "success" && resp.content) {
        setGeneratedContent(resp.content);
        setEditableContent(resp.content);
        toast({
          title: "Tạo nội dung thành công!",
          description: "Bài viết đã được tạo.",
        });
        setOpenDialog(true);
      } else {
        toast({
          title: "Lỗi",
          description: resp.error || "Đã xảy ra lỗi khi tạo nội dung!",
          variant: "destructive",
        });
        console.error("Lỗi từ webhook:", resp.error);
      }
    } catch (error) {
      console.error("Lỗi exception:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi webhook.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
      <h1 className="text-2xl font-bold mb-1">Tạo nội dung</h1>
      <p className="text-gray-500 mb-6">Tạo bài viết chuẩn SEO với công nghệ AI</p>
      
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
              resolution={resolution}
              setResolution={setResolution}
              keepAspectRatio={keepAspectRatio}
              setKeepAspectRatio={setKeepAspectRatio}
              optimizeImages={optimizeImages}
              setOptimizeImages={setOptimizeImages}
            />
          </div>
        </Tabs>
      </div>

      <div className="mt-8 flex justify-end w-full">
        <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Tạo bài viết
        </Button>
      </div>

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
