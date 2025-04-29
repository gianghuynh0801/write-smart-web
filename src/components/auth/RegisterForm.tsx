
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RegisterFormFields } from "./form/RegisterFormFields";
import { VerificationDialog } from "./verification/VerificationDialog";
import { useRegisterForm } from "./hooks/useRegisterForm";

export function RegisterForm() {
  const {
    formData,
    isLoading,
    error,
    showVerificationDialog,
    handleChange,
    handleSubmit,
    closeVerificationDialog,
    progress
  } = useRegisterForm();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <RegisterFormFields 
          formData={formData}
          handleChange={handleChange}
        />
        
        {isLoading && progress > 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              {progress < 30 ? "Đang kiểm tra thông tin..." :
               progress < 60 ? "Đang tạo tài khoản..." :
               progress < 85 ? "Đang thiết lập dữ liệu..." :
               "Đang hoàn tất quá trình..."}
            </p>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </form>

      <VerificationDialog
        open={showVerificationDialog}
        email={formData.email}
        onClose={closeVerificationDialog}
      />
    </>
  );
}
