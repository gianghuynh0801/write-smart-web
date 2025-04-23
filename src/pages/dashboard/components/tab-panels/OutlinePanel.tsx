
import { TabsContent } from "@/components/ui/tabs";
import { LayoutList } from "lucide-react";
import ContentOutline, { OutlineItem } from "../ContentOutline";
import TabLayout from "./TabLayout";

interface OutlinePanelProps {
  outlineItems: OutlineItem[];
  onOutlineChange: (items: OutlineItem[]) => void;
}

const OutlinePanel = ({ outlineItems, onOutlineChange }: OutlinePanelProps) => {
  return (
    <TabsContent value="outline" className="mt-0 animate-fade-in">
      <ContentOutline
        outlineItems={outlineItems}
        onOutlineChange={onOutlineChange}
      />
    </TabsContent>
  );
};

export default OutlinePanel;
