
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Plus, Tag, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUB_KEY_LIMIT = 3;
const RELATED_KEY_LIMIT = 3;

interface KeywordInputsProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
}

const KeywordInputs = ({
  mainKeyword,
  setMainKeyword,
  subKeywords,
  setSubKeywords,
  relatedKeywords,
  setRelatedKeywords,
}: KeywordInputsProps) => {
  const [subKeywordInput, setSubKeywordInput] = useState("");
  const [relatedKeywordInput, setRelatedKeywordInput] = useState("");
  const { toast } = useToast();

  const handleAddSubKeyword = () => {
    const trimmed = subKeywordInput.trim();
    if (!trimmed) return;
    if (subKeywords.includes(trimmed)) {
      setSubKeywordInput("");
      return;
    }
    if (subKeywords.length >= SUB_KEY_LIMIT) {
      toast({
        title: "Đã đạt giới hạn",
        description: "Bạn chỉ có thể thêm tối đa 3 từ khoá phụ.",
        variant: "destructive",
      });
      return;
    }
    setSubKeywords([...subKeywords, trimmed]);
    setSubKeywordInput("");
  };

  const handleRemoveSubKeyword = (keyword: string) => {
    setSubKeywords(subKeywords.filter((item) => item !== keyword));
  };

  const handleAddRelatedKeyword = () => {
    const trimmed = relatedKeywordInput.trim();
    if (!trimmed) return;
    if (relatedKeywords.includes(trimmed)) {
      setRelatedKeywordInput("");
      return;
    }
    if (relatedKeywords.length >= RELATED_KEY_LIMIT) {
      toast({
        title: "Đã đạt giới hạn",
        description: "Bạn chỉ có thể thêm tối đa 3 từ khoá liên quan.",
        variant: "destructive",
      });
      return;
    }
    setRelatedKeywords([...relatedKeywords, trimmed]);
    setRelatedKeywordInput("");
  };

  const handleRemoveRelatedKeyword = (keyword: string) => {
    setRelatedKeywords(relatedKeywords.filter((item) => item !== keyword));
  };

  return (
    <div className="space-y-6 max-w-xl">
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
      
      <div className="space-y-2">
        <Label htmlFor="sub-keyword">Từ khoá phụ</Label>
        {Array.from({ length: subKeywords.length + (subKeywords.length < SUB_KEY_LIMIT ? 1 : 0) }).map((_, idx) => (
          <div className="flex gap-2 mt-2" key={idx}>
            {idx < subKeywords.length ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {subKeywords[idx]}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemoveSubKeyword(subKeywords[idx])}
                  className="ml-1 text-gray-500 hover:text-destructive"
                  aria-label="Xoá từ khoá phụ"
                >
                  <List className="w-3 h-3" />
                </Button>
              </span>
            ) : (
              <>
                <Input
                  id="sub-keyword-input-row"
                  name="sub-keyword"
                  placeholder="Nhập từ khoá phụ"
                  value={subKeywordInput}
                  onChange={(e) => setSubKeywordInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubKeyword();
                    }
                  }}
                  disabled={subKeywords.length >= SUB_KEY_LIMIT}
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleAddSubKeyword}
                  className="px-2"
                  disabled={subKeywords.length >= SUB_KEY_LIMIT}
                >
                  <Plus className="h-4 w-4" />
                  Thêm mới
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="related-keyword">Từ khoá liên quan</Label>
        {Array.from({ length: relatedKeywords.length + (relatedKeywords.length < RELATED_KEY_LIMIT ? 1 : 0) }).map((_, idx) => (
          <div className="flex gap-2 mt-2" key={idx}>
            {idx < relatedKeywords.length ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {relatedKeywords[idx]}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemoveRelatedKeyword(relatedKeywords[idx])}
                  className="ml-1 text-gray-500 hover:text-destructive"
                  aria-label="Xoá từ khoá liên quan"
                >
                  <List className="w-3 h-3" />
                </Button>
              </span>
            ) : (
              <>
                <Input
                  id="related-keyword-input-row"
                  name="related-keyword"
                  placeholder="Nhập từ khoá liên quan"
                  value={relatedKeywordInput}
                  onChange={(e) => setRelatedKeywordInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRelatedKeyword();
                    }
                  }}
                  disabled={relatedKeywords.length >= RELATED_KEY_LIMIT}
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleAddRelatedKeyword}
                  className="px-2"
                  disabled={relatedKeywords.length >= RELATED_KEY_LIMIT}
                >
                  <Plus className="h-4 w-4" />
                  Thêm mới
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordInputs;
