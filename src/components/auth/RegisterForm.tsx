
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    closeVerificationDialog
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
