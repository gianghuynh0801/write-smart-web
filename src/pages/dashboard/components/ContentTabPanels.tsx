import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { FileText, Book, Text, Link as LinkIcon, Key, Image } from "lucide-react";
import KeywordInputs from "./KeywordInputs";
import ContentOutline from "./ContentOutline";
import ContentSettings from "./ContentSettings";
import KnowledgePanel from "./KnowledgePanel";
import FormatSettings from "./FormatSettings";
import LinkSettings from "./LinkSettings";
import ImageSettings from "./ImageSettings";
import { OutlineItem } from "./ContentOutline";

interface ContentTabPanelsProps {
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
  resolution: number;
  setResolution: (value: number) => void;
  keepAspectRatio: boolean;
  setKeepAspectRatio: (value: boolean) => void;
  optimizeImages: boolean;
  setOptimizeImages: (value: boolean) => void;
}

const ContentTabPanels = ({
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
  resolution,
  setResolution,
  keepAspectRatio,
  setKeepAspectRatio,
  optimizeImages,
  setOptimizeImages,
}: ContentTabPanelsProps) => {
  const [language, setLanguage] = useState("vi");
  const [country, setCountry] = useState("vn");
  const [tone, setTone] = useState("Neutral");
  const [narrator, setNarrator] = useState("tự động");
  const [formality, setFormality] = useState("tự động");

  return (
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
          <ContentSettings
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
      </TabsContent>

      <TabsContent value="knowledge" className="mt-0 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" /> Kiến thức cho bài viết
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hệ thống sẽ cung cấp kiến thức cho bài viết của bạn.
          </p>
          <KnowledgePanel
            webConnection={webConnection}
            setWebConnection={setWebConnection}
            reference={reference}
            setReference={setReference}
          />
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
          <FormatSettings
            bold={bold}
            setBold={setBold}
            italic={italic}
            setItalic={setItalic}
            useList={useList}
            setUseList={setUseList}
          />
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
          <LinkSettings links={links} setLinks={setLinks} />
        </div>
      </TabsContent>

      <TabsContent value="images" className="mt-0 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" /> Hình ảnh cho bài viết
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Quản lý cài đặt kích thước hình ảnh trong bài viết của bạn
          </p>
          <ImageSettings
            imageSize={imageSize}
            setImageSize={setImageSize}
          />
        </div>
      </TabsContent>
    </div>
  );
};

export default ContentTabPanels;
