import { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import ContentTabs from "./components/ContentTabs";
import ContentTabPanels from "./components/ContentTabPanels";
import PreviewDialog from "./components/PreviewDialog";
import ContentHeader from "./components/ContentHeader";
import ContentGenerateButton from "./components/ContentGenerateButton";
import { useContentGeneration } from "./hooks/useContentGeneration";
import { useToast } from "@/hooks/use-toast";
import { OutlineItem } from "./components/ContentOutline";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";

const CreateContent = () => {
  const [activeTab, setActiveTab] = useState("keywords");
  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [hasWebhook, setHasWebhook] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

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
  const [resolution, setResolution] = useState(72);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(true);
  
  const [language, setLanguage] = useState("vi");
  const [country, setCountry] = useState("vn");
  const [tone, setTone] = useState("Neutral");
  const [narrator, setNarrator] = useState("tự động");
  const [formality, setFormality] = useState("tự động");

  const { isGenerating, generateContent } = useContentGeneration();

  useEffect(() => {
    const checkWebhookAndAdminStatus = async () => {
      setIsLoading(true);
      try {
        const { data: webhookData, error: webhookError } = await supabase
          .from('system_configurations')
          .select('value')
          .eq('key', 'webhook_url')
          .maybeSingle();

        if (webhookError) {
          console.error('Lỗi khi kiểm tra webhook URL:', webhookError);
        } else {
          setHasWebhook(!!webhookData?.value);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { roleData } = await checkAdminRole(session.user.id);
          setIsAdmin(!!roleData);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra webhook hoặc quyền admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWebhookAndAdminStatus();
  }, []);

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
      language,
      country,
      tone,
      narrator,
      formality,
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
      
      {hasWebhook === false && !isLoading && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cần cấu hình webhook URL</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              Hệ thống chưa có URL webhook được cấu hình. Để sử dụng tính năng tạo nội dung,
              vui lòng yêu cầu quản trị viên cấu hình URL webhook.
            </p>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.location.href = '/admin/settings'}
              >
                <Settings className="h-4 w-4" /> 
                Đi đến trang cấu hình
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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
              language={language}
              setLanguage={setLanguage}
              country={country}
              setCountry={setCountry}
              tone={tone}
              setTone={setTone}
              narrator={narrator}
              setNarrator={setNarrator}
              formality={formality}
              setFormality={setFormality}
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
