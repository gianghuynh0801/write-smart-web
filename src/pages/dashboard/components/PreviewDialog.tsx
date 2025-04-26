
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, FileUp, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editableContent: string;
  onEditableContentChange: (content: string) => void;
  mainKeyword: string;
  onSave: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

const PreviewDialog = ({
  open,
  onOpenChange,
  editableContent,
  onEditableContentChange,
  mainKeyword,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
}: PreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bài viết đã tạo ({mainKeyword})</DialogTitle>
          <DialogDescription>
            Soạn thảo, lưu nháp hoặc đăng bài viết từ AI:
          </DialogDescription>
        </DialogHeader>
        <RichTextEditor
          value={editableContent}
          onChange={onEditableContentChange}
          placeholder="Nội dung bài viết ..."
          className="mb-2"
        />
        <div className="flex justify-end gap-2 mt-3">
          <Button 
            variant="outline" 
            onClick={onSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {isSaving ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
          <Button 
            variant="default" 
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4 mr-1" />
            )}
            {isPublishing ? "Đang đăng..." : "Đăng bài viết"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
