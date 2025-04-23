
import { TabsContent } from "@/components/ui/tabs";
import { Text } from "lucide-react";
import FormatSettings from "../FormatSettings";
import TabLayout from "./TabLayout";

interface FormatPanelProps {
  bold: boolean;
  setBold: (value: boolean) => void;
  italic: boolean;
  setItalic: (value: boolean) => void;
  useList: boolean;
  setUseList: (value: boolean) => void;
}

const FormatPanel = (props: FormatPanelProps) => {
  return (
    <TabsContent value="format" className="mt-0 animate-fade-in">
      <TabLayout
        icon={<Text className="h-5 w-5 text-primary" />}
        title="Định dạng cho bài viết"
        description="Hệ thống sẽ định dạng cho bài viết của bạn."
      >
        <FormatSettings {...props} />
      </TabLayout>
    </TabsContent>
  );
};

export default FormatPanel;
