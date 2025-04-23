
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface ContentGenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const ContentGenerateButton = ({ onClick, isLoading }: ContentGenerateButtonProps) => {
  return (
    <div className="mt-8 flex justify-end w-full">
      <Button onClick={onClick} className="flex items-center gap-2" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Tạo bài viết
      </Button>
    </div>
  );
};

export default ContentGenerateButton;
