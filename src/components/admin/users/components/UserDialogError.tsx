
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserDialogErrorProps {
  error: string;
  onRetry: () => void;
}

export const UserDialogError = ({ error, onRetry }: UserDialogErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <p className="font-medium text-destructive">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Thử lại
        </Button>
      </div>
    </div>
  );
};
