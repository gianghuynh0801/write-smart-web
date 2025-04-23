
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FormalitySelectorProps {
  formality: string;
  setFormality: (value: string) => void;
}

const FormalitySelector = ({ formality, setFormality }: FormalitySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="formality">Mức độ</Label>
      <Select value={formality} onValueChange={setFormality}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn mức độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tự động">Tự động</SelectItem>
            <SelectItem value="formal">Trang trọng</SelectItem>
            <SelectItem value="informal">Thảo mái</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Lựa chọn giọng văn phù hợp với ngữ cảnh bài viết.
      </p>
    </div>
  );
};

export default FormalitySelector;
