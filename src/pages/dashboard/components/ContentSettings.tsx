
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LANGUAGES, COUNTRIES } from "./contentData";

interface ContentSettingsProps {
  language: string;
  setLanguage: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  narrator: string;
  setNarrator: (value: string) => void;
  formality: string;
  setFormality: (value: string) => void;
}

const ContentSettings = ({
  language,
  setLanguage,
  country,
  setCountry,
  tone,
  setTone,
  narrator,
  setNarrator,
  formality,
  setFormality,
}: ContentSettingsProps) => {
  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="country">Quốc gia</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn quốc gia" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Quốc gia mục tiêu mà nội dung sẽ tập trung hướng đến
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone">Giọng nói</Label>
        <Input
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Ví dụ: Trung lập"
          maxLength={80}
        />
        <p className="text-sm text-muted-foreground">
          Ví dụ: vui vẻ, trung lập, học thuật
        </p>
      </div>

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
    </div>
  );
};

export default ContentSettings;
