
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, FileUp } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editableContent: string;
  onEditableContentChange: (content: string) => void;
  mainKeyword: string;
  onSave: () => void;
  onPublish: () => void;
}

const PreviewDialog = ({
  open,
  onOpenChange,
  editableContent,
  onEditableContentChange,
  mainKeyword,
  onSave,
  onPublish,
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
          <Button variant="outline" onClick={onSave}>
            <Save className="w-4 h-4 mr-1" />
            Lưu bài viết
          </Button>
          <Button variant="default" onClick={onPublish}>
            <FileUp className="w-4 h-4 mr-1" />
            Đăng bài viết
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
