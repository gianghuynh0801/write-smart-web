
import { TabsContent } from "@/components/ui/tabs";
import { Key } from "lucide-react";
import KeywordInputs from "../KeywordInputs";
import TabLayout from "./TabLayout";

interface KeywordsPanelProps {
  activeTab: string;
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
}

const KeywordsPanel = ({
  activeTab,
  mainKeyword,
  setMainKeyword,
  subKeywords,
  setSubKeywords,
  relatedKeywords,
  setRelatedKeywords,
}: KeywordsPanelProps) => {
  return (
    <TabsContent value="keywords" className="mt-0 animate-fade-in">
      {activeTab === "keywords" && (
        <TabLayout
          icon={<Key className="h-5 w-5 text-primary" />}
          title="Từ khoá cho bài viết"
          description="Hệ thống sẽ ép các từ khoá này vào phần ai tạo. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết."
        >
          <KeywordInputs
            mainKeyword={mainKeyword}
            setMainKeyword={setMainKeyword}
            subKeywords={subKeywords}
            setSubKeywords={setSubKeywords}
            relatedKeywords={relatedKeywords}
            setRelatedKeywords={setRelatedKeywords}
          />
        </TabLayout>
      )}
    </TabsContent>
  );
};

export default KeywordsPanel;
