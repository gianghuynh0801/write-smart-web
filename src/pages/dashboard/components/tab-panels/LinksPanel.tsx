
import { TabsContent } from "@/components/ui/tabs";
import { Link as LinkIcon } from "lucide-react";
import LinkSettings from "../LinkSettings";
import TabLayout from "./TabLayout";

interface LinksPanelProps {
  activeTab: string;
  links: Array<{ keyword: string; url: string }>;
  setLinks: (links: Array<{ keyword: string; url: string }>) => void;
}

const LinksPanel = ({ activeTab, links, setLinks }: LinksPanelProps) => {
  return (
    <TabsContent value="links" className="mt-0 animate-fade-in">
      {activeTab === "links" && (
        <TabLayout
          icon={<LinkIcon className="h-5 w-5 text-primary" />}
          title="Liên kết cho bài viết"
          description="Hệ thống sẽ tạo liên kết cho bài viết của bạn."
        >
          <LinkSettings links={links} setLinks={setLinks} />
        </TabLayout>
      )}
    </TabsContent>
  );
};

export default LinksPanel;
