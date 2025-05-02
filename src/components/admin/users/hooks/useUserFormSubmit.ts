
import { UserFormValues } from "@/types/user";

interface UseUserFormSubmitProps {
  onSubmit: (data: UserFormValues) => Promise<void>;
  isLoading: boolean;
  isSubmitting: boolean;
}

export const useUserFormSubmit = ({ 
  onSubmit, 
  isLoading, 
  isSubmitting 
}: UseUserFormSubmitProps) => {
  const buttonDisabled = isLoading || isSubmitting;
  
  const handleFormSubmit = async (data: UserFormValues) => {
    if (buttonDisabled) return;
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
    }
  };
  
  return {
    handleFormSubmit,
    buttonDisabled
  };
};
