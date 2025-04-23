
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Key,
  LayoutList,
  FileText,
  Book,
  Text,
  Link as LinkIcon,
  Image,
} from "lucide-react";

export const verticalTabs = [
  {
    value: "keywords",
    label: "Từ khoá",
    icon: Key,
  },
  {
    value: "outline",
    label: "Outline",
    icon: LayoutList,
  },
  {
    value: "content",
    label: "Nội dung",
    icon: FileText,
  },
  {
    value: "knowledge",
    label: "Kiến thức",
    icon: Book,
  },
  {
    value: "format",
    label: "Định dạng",
    icon: Text,
  },
  {
    value: "links",
    label: "Liên kết",
    icon: LinkIcon,
  },
  {
    value: "images",
    label: "Hình ảnh",
    icon: Image,
  },
];

interface ContentTabsProps {
  activeTab: string;
}

const ContentTabs = ({ activeTab }: ContentTabsProps) => {
  return (
    <TabsList className="flex flex-col h-auto w-56 bg-muted/70 p-1.5 rounded-xl shadow sticky top-6">
      {verticalTabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="flex items-center justify-start gap-2 mb-1 px-4 py-3 text-left text-base"
        >
          <tab.icon className="h-5 w-5" />
          <span>{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ContentTabs;
