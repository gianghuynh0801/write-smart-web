
import { Loader } from "lucide-react";

/**
 * Component hiển thị trạng thái loading trong UserDialog
 * Được sử dụng khi đang tải thông tin người dùng
 */
export const UserDialogLoading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
