
import { Loader } from "lucide-react";

export const UserDialogLoading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
