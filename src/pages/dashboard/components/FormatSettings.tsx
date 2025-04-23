
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { bold, italic, list } from "lucide-react";

interface FormatSettingsProps {
  bold: boolean;
  setBold: (value: boolean) => void;
  italic: boolean;
  setItalic: (value: boolean) => void;
  useList: boolean;
  setUseList: (value: boolean) => void;
}

const FormatSettings = ({
  bold,
  setBold,
  italic,
  setItalic,
  useList,
  setUseList,
}: FormatSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center w-full gap-6 py-5">
        <div className="flex-1 min-w-0 space-y-1">
          <Label htmlFor="bold" className="text-base font-medium flex items-center gap-2">
            <bold className="h-4 w-4" />
            In đậm
          </Label>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ in đậm những từ khóa quan trọng trong bài viết của bạn.
          </p>
        </div>
        <Switch
          id="bold"
          checked={bold}
          onCheckedChange={setBold}
        />
      </div>

      <div className="flex items-center w-full gap-6 py-5">
        <div className="flex-1 min-w-0 space-y-1">
          <Label htmlFor="italic" className="text-base font-medium flex items-center gap-2">
            <italic className="h-4 w-4" />
            In nghiêng
          </Label>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ sử dụng chữ in nghiêng để nhấn mạnh một cách tinh tế trong bài viết của bạn.
          </p>
        </div>
        <Switch
          id="italic"
          checked={italic}
          onCheckedChange={setItalic}
        />
      </div>

      <div className="flex items-center w-full gap-6 py-5">
        <div className="flex-1 min-w-0 space-y-1">
          <Label htmlFor="list" className="text-base font-medium flex items-center gap-2">
            <list className="h-4 w-4" />
            Liệt kê
          </Label>
          <p className="text-sm text-muted-foreground">
            Nếu bạn đồng ý, tôi sẽ đưa tạo liệt kê cho bạn
          </p>
        </div>
        <Switch
          id="list"
          checked={useList}
          onCheckedChange={setUseList}
        />
      </div>
    </div>
  );
};

export default FormatSettings;
