
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";

export const UserTableLoading = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex justify-center">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      </TableCell>
    </TableRow>
  );
};
