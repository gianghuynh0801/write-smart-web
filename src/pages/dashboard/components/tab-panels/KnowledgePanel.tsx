
import { TabsContent } from "@/components/ui/tabs";
import { Book } from "lucide-react";
import KnowledgePanel from "../KnowledgePanel";
import TabLayout from "./TabLayout";

interface KnowledgePanelProps {
  webConnection: boolean;
  setWebConnection: (value: boolean) => void;
  reference: string;
  setReference: (value: string) => void;
}

const KnowledgePanelWrapper = (props: KnowledgePanelProps) => {
  return (
    <TabsContent value="knowledge" className="mt-0 animate-fade-in" forceMount>
      <TabLayout
        icon={<Book className="h-5 w-5 text-primary" />}
        title="Kiến thức cho bài viết"
        description="Hệ thống sẽ cung cấp kiến thức cho bài viết của bạn."
      >
        <KnowledgePanel {...props} />
      </TabLayout>
    </TabsContent>
  );
};

export default KnowledgePanelWrapper;
