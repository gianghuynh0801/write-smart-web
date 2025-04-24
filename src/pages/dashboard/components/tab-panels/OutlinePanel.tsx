
import { TabsContent } from "@/components/ui/tabs";
import { LayoutList } from "lucide-react";
import ContentOutline, { OutlineItem } from "../ContentOutline";
import TabLayout from "./TabLayout";

interface OutlinePanelProps {
  activeTab: string;
  outlineItems: OutlineItem[];
  onOutlineChange: (items: OutlineItem[]) => void;
}

const OutlinePanel = ({ activeTab, outlineItems, onOutlineChange }: OutlinePanelProps) => {
  return (
    <TabsContent value="outline" className="mt-0 animate-fade-in">
      {activeTab === "outline" && (
        <TabLayout
          icon={<LayoutList className="h-5 w-5 text-primary" />}
          title="Cấu trúc cho bài viết"
          description="Điều chỉnh cấu trúc bài viết của bạn."
        >
          <ContentOutline
            outlineItems={outlineItems}
            onOutlineChange={onOutlineChange}
          />
        </TabLayout>
      )}
    </TabsContent>
  );
};

export default OutlinePanel;
