
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Tag, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RELATED_KEY_LIMIT = 3;

interface RelatedKeywordInputProps {
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
}

const RelatedKeywordInput = ({ relatedKeywords, setRelatedKeywords }: RelatedKeywordInputProps) => {
  const [relatedKeywordInput, setRelatedKeywordInput] = useState("");
  const { toast } = useToast();

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
  );
};

export default RelatedKeywordInput;
