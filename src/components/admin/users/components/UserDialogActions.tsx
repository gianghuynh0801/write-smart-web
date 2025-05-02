
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface UserDialogActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isUpdate: boolean;
}

export const UserDialogActions = ({
  onCancel,
  isSubmitting,
  isUpdate
}: UserDialogActionsProps) => {
  const buttonDisabled = isSubmitting;
  
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={buttonDisabled}
      >
        Hủy bỏ
      </Button>
      <Button 
        type="submit" 
        disabled={buttonDisabled}
      >
        {isSubmitting && 
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        }
        {isUpdate ? "Cập nhật" : "Tạo mới"}
      </Button>
    </div>
  );
};
