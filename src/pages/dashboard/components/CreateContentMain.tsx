
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import ContentTabs from "./ContentTabs";
import ContentTabPanels from "./ContentTabPanels";
import PreviewDialog from "./PreviewDialog";
import ContentHeader from "./ContentHeader";
import ContentGenerateButton from "./ContentGenerateButton";
import WebhookAlert from "./WebhookAlert";
import { useArticleActions } from "../hooks/useArticleActions";
import { OutlineItem } from "./ContentOutline";

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
  // Form state props
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
  outlineItems: OutlineItem[];
  setOutlineItems: (items: OutlineItem[]) => void;
  webConnection: boolean;
  setWebConnection: (value: boolean) => void;
  reference: string;
  setReference: (value: string) => void;
  bold: boolean;
  setBold: (value: boolean) => void;
  italic: boolean;
  setItalic: (value: boolean) => void;
  useList: boolean;
  setUseList: (value: boolean) => void;
  links: Array<{ keyword: string; url: string }>;
  setLinks: (links: Array<{ keyword: string; url: string }>) => void;
  imageSize: string;
  setImageSize: (size: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  narrator: string;
  setNarrator: (value: string) => void;
  formality: string;
  setFormality: (value: string) => void;
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
  onOpenDialogChange,
  // Form state props
  mainKeyword,
  setMainKeyword,
  subKeywords,
  setSubKeywords,
  relatedKeywords,
  setRelatedKeywords,
  outlineItems,
  setOutlineItems,
  webConnection,
  setWebConnection,
  reference,
  setReference,
  bold,
  setBold,
  italic,
  setItalic,
  useList,
  setUseList,
  links,
  setLinks,
  imageSize,
  setImageSize,
  language,
  setLanguage,
  country,
  setCountry,
  tone,
  setTone,
  narrator,
  setNarrator,
  formality,
  setFormality
}: CreateContentMainProps) => {
  const [activeTab, setActiveTab] = useState("keywords");
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
        onClick={onSubmit}
        isLoading={isGenerating}
      />

      <PreviewDialog
        open={openDialog}
        onOpenChange={onOpenDialogChange}
        editableContent={editableContent}
        onEditableContentChange={onEditableContentChange}
        mainKeyword={mainKeyword}
        onSave={() => handleSave(editableContent, mainKeyword, subKeywords)}
        onPublish={() => handlePublish(editableContent, mainKeyword)}
      />
    </div>
  );
};

export default CreateContentMain;
