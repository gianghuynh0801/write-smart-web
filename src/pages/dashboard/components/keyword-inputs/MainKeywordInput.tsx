
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MainKeywordInputProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
}

const MainKeywordInput = ({ mainKeyword, setMainKeyword }: MainKeywordInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="main-keyword">Từ khoá chính <span className="text-destructive">*</span></Label>
      <Input
        id="main-keyword"
        name="main-keyword"
        placeholder="Nhập từ khoá chính"
        value={mainKeyword}
        onChange={(e) => setMainKeyword(e.target.value)}
        required
      />
      <p className="text-xs text-muted-foreground ml-1">
        Bài viết sẽ tập trung vào từ khoá này.
      </p>
    </div>
  );
};

export default MainKeywordInput;
