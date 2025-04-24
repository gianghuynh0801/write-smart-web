
import { TabsContent } from "@/components/ui/tabs";
import { Image } from "lucide-react";
import ImageSettings from "../ImageSettings";
import TabLayout from "./TabLayout";

interface ImagesPanelProps {
  imageSize: string;
  setImageSize: (size: string) => void;
}

const ImagesPanel = ({ imageSize, setImageSize }: ImagesPanelProps) => {
  return (
    <TabsContent value="images" className="mt-0 animate-fade-in" forceMount>
      <TabLayout
        icon={<Image className="h-5 w-5 text-primary" />}
        title="Hình ảnh cho bài viết"
        description="Quản lý cài đặt kích thước hình ảnh trong bài viết của bạn"
      >
        <ImageSettings imageSize={imageSize} setImageSize={setImageSize} />
      </TabLayout>
    </TabsContent>
  );
};

export default ImagesPanel;
