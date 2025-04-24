
import { TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import ContentSettings from "../ContentSettings";
import TabLayout from "./TabLayout";

interface ContentPanelProps {
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

const ContentPanel = (props: ContentPanelProps) => {
  return (
    <TabsContent value="content" className="mt-0 animate-fade-in" forceMount>
      <TabLayout
        icon={<FileText className="h-5 w-5 text-primary" />}
        title="Nội dung cho bài viết"
        description="Hệ thống sẽ tạo nội dung cho bài viết của bạn."
      >
        <ContentSettings {...props} />
      </TabLayout>
    </TabsContent>
  );
};

export default ContentPanel;
