
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserTableErrorProps {
  errorMessage: string;
  onRetry?: () => void;
}

export const UserTableError = ({ errorMessage, onRetry }: UserTableErrorProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertTriangle className="h-8 w-8" />
          <div className="font-medium">Có lỗi xảy ra</div>
          <div className="text-sm max-w-md">{errorMessage || "Không thể tải dữ liệu người dùng"}</div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Thử lại
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
