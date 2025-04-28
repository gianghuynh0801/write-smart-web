
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface UserTableErrorProps {
  errorMessage: string;
}

export const UserTableError = ({ errorMessage }: UserTableErrorProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertTriangle className="h-8 w-8" />
          <div className="font-medium">Có lỗi xảy ra</div>
          <div className="text-sm">{errorMessage || "Không thể tải dữ liệu người dùng"}</div>
        </div>
      </TableCell>
    </TableRow>
  );
};
