
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NarratorSelectorProps {
  narrator: string;
  setNarrator: (value: string) => void;
}

const NarratorSelector = ({ narrator, setNarrator }: NarratorSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="narrator">Ngôi kể</Label>
      <Select value={narrator} onValueChange={setNarrator}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn ngôi kể" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tự động">Tự động</SelectItem>
            <SelectItem value="first-plural">Ngôi thứ nhất số nhiều (chúng ta, chúng tôi)</SelectItem>
            <SelectItem value="first-singular">Ngôi thứ nhất số ít (tôi, của tôi)</SelectItem>
            <SelectItem value="second">Ngôi thứ hai (bạn, của bạn)</SelectItem>
            <SelectItem value="third">Ngôi thứ ba (anh ấy, cô ấy, nó, họ)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Điều này sẽ ảnh hưởng đến các đại từ được sử dụng trong bài viết.
      </p>
    </div>
  );
};

export default NarratorSelector;
