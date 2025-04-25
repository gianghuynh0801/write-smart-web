
import { Button } from "@/components/ui/button";
import { useSmtpConfig } from "./SmtpConfigContext";

export function SmtpSaveButton() {
  const { handleSave, isLoading } = useSmtpConfig();

  return (
    <div className="flex justify-end">
      <Button
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </div>
  );
}
