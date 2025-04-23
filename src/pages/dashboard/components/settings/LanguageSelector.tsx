
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "../contentData";

interface LanguageSelectorProps {
  language: string;
  setLanguage: (value: string) => void;
}

const LanguageSelector = ({ language, setLanguage }: LanguageSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">Ngôn ngữ</Label>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn ngôn ngữ" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Ngôn ngữ mà tất cả các bài viết sẽ được viết.
      </p>
    </div>
  );
};

export default LanguageSelector;
