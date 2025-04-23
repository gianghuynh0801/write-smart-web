import { TabsContent } from "@/components/ui/tabs";
import { FileText, Book, Text, Link as LinkIcon, Key } from "lucide-react";
import KeywordInputs from "./KeywordInputs";
import ContentOutline from "./ContentOutline";
import { OutlineItem } from "./ContentOutline";
import ContentSettings from "./ContentSettings";
import { useState } from "react";

interface ContentTabPanelsProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
  outlineItems: OutlineItem[];
  setOutlineItems: (items: OutlineItem[]) => void;
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
  );
};

export default ContentTabPanels;
