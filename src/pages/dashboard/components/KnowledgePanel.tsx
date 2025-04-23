
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KnowledgePanelProps {
  webConnection: boolean;
  setWebConnection: (value: boolean) => void;
  reference: string;
  setReference: (value: string) => void;
}

const KnowledgePanel = ({
  webConnection,
  setWebConnection,
  reference,
  setReference,
}: KnowledgePanelProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center w-full gap-6 py-5">
        <div className="flex-1 min-w-0 space-y-1">
          <Label htmlFor="connect-to-web" className="text-base font-medium">
            Kết nối đến web
          </Label>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ tìm kiếm các chủ đề tương tự trên Google để tạo ra nội dung mới nhất.
          </p>
        </div>
        <Switch
          id="connect-to-web"
          checked={webConnection}
          onCheckedChange={setWebConnection}
        />
      </div>

      <div className="py-5">
        <Label htmlFor="reference" className="text-base font-medium">
          Nguồn tham khảo
        </Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="https://matbao.net/"
          className="mt-2 mb-2"
        />
      </div>

      <div className="py-5">
        <Label className="text-base font-medium mb-5 block">
          Mô hình AI
        </Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <img
              src="https://ai-content.support247.top/images/ChatGPT_logo.png"
              alt="ChatGPT Logo"
              className="h-16 object-contain mb-2"
            />
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg hover:border-purple-500 transition-colors cursor-pointer">
            <img
              src="https://ai-content.support247.top/images/Gemini_language_model_logo.png"
              alt="Gemini Logo"
              className="h-16 object-contain mb-2"
            />
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg hover:border-green-500 transition-colors cursor-pointer">
            <img
              src="https://ai-content.support247.top/images/1200px-Claude_AI_logo.svg.png"
              alt="Claude Logo"
              className="h-16 object-contain mb-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePanel;
