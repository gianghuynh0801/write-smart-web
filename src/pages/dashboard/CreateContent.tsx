
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Send,
  Key,
  LayoutList,
  FileText,
  Book,
  Text,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateContent } from "@/utils/webhookService";
import KeywordInputs from "./components/KeywordInputs";
import ContentOutline, { OutlineItem } from "./components/ContentOutline";
import PreviewDialog from "./components/PreviewDialog";

const verticalTabs = [
  {
    value: "keywords",
    label: "Từ khoá",
    icon: Key,
  },
  {
    value: "outline",
    label: "Outline",
    icon: LayoutList,
  },
  {
    value: "content",
    label: "Nội dung",
    icon: FileText,
  },
  {
    value: "knowledge",
    label: "Kiến thức",
    icon: Book,
  },
  {
    value: "format",
    label: "Định dạng",
    icon: Text,
  },
  {
    value: "links",
    label: "Liên kết",
    icon: LinkIcon,
  },
  {
    value: "images",
    label: "Hình ảnh",
    icon: LinkIcon,
  },
];

const CreateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState(verticalTabs[0].value);
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
        topic: mainKeyword,
        keywords: [mainKeyword, ...subKeywords, ...relatedKeywords].join(", "),
      };

      console.log("Gửi yêu cầu tạo nội dung với params:", params);
      
      const resp = await generateContent(
        params,
        "https://workflow.matbao.support/webhook-test/80808e9c-a56a-4b4f-83da-7710fae0bda7"
      );
      
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
          className="flex flex-col md:flex-row gap-6"
        >
          <TabsList className="flex flex-col h-auto w-56 bg-muted/70 p-1.5 rounded-xl shadow">
            {verticalTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center justify-start gap-2 mb-1 px-4 py-3 text-left text-base",
                  activeTab === tab.value ? "bg-background text-primary font-medium" : ""
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-1 flex-col md:flex-row gap-6">
            <div className="flex-1">
              <TabsContent value="keywords" className="mt-0 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" /> Từ khoá cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ ép các từ khoá này vào phần ai tạo. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết.
                  </p>
                </div>

                <KeywordInputs
                  mainKeyword={mainKeyword}
                  setMainKeyword={setMainKeyword}
                  subKeywords={subKeywords}
                  setSubKeywords={setSubKeywords}
                  relatedKeywords={relatedKeywords}
                  setRelatedKeywords={setRelatedKeywords}
                />
              </TabsContent>
              <TabsContent value="outline" className="mt-0 animate-fade-in">
                <ContentOutline
                  outlineItems={outlineItems}
                  onOutlineChange={setOutlineItems}
                />
              </TabsContent>
              <TabsContent value="content" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Nội dung cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo nội dung cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="knowledge" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" /> Kiến thức cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ cung cấp kiến thức cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="format" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Text className="h-5 w-5 text-primary" /> Định dạng cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ định dạng cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="links" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" /> Liên kết cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo liên kết cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="images" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" /> Hình ảnh cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo hình ảnh cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
            </div>
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
