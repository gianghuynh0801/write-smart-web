
import { TabsContent } from "@/components/ui/tabs";
import { Text } from "lucide-react";
import FormatSettings from "../FormatSettings";
import TabLayout from "./TabLayout";

interface FormatPanelProps {
  activeTab: string;
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
      {props.activeTab === "format" && (
        <TabLayout
          icon={<Text className="h-5 w-5 text-primary" />}
          title="Định dạng cho bài viết"
          description="Hệ thống sẽ định dạng cho bài viết của bạn."
        >
          <FormatSettings
            bold={props.bold}
            setBold={props.setBold}
            italic={props.italic}
            setItalic={props.setItalic}
            useList={props.useList}
            setUseList={props.setUseList}
          />
        </TabLayout>
      )}
    </TabsContent>
  );
};

export default FormatPanel;
