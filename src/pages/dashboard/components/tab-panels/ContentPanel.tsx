
import { TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import ContentSettings from "../ContentSettings";
import TabLayout from "./TabLayout";

interface ContentPanelProps {
  activeTab: string;
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
    <TabsContent value="content" className="mt-0 animate-fade-in">
      {props.activeTab === "content" && (
        <TabLayout
          icon={<FileText className="h-5 w-5 text-primary" />}
          title="Nội dung cho bài viết"
          description="Hệ thống sẽ tạo nội dung cho bài viết của bạn."
        >
          <ContentSettings
            language={props.language}
            setLanguage={props.setLanguage}
            country={props.country}
            setCountry={props.setCountry}
            tone={props.tone}
            setTone={props.setTone}
            narrator={props.narrator}
            setNarrator={props.setNarrator}
            formality={props.formality}
            setFormality={props.setFormality}
          />
        </TabLayout>
      )}
    </TabsContent>
  );
};

export default ContentPanel;
