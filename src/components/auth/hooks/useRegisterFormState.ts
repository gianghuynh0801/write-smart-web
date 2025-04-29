
import { useState } from "react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useRegisterFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  // Thêm state để theo dõi tiến trình
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return {
    formData,
    isLoading,
    error,
    showVerificationDialog,
    progress,
    setProgress,
    setIsLoading,
    setError,
    setShowVerificationDialog,
    handleChange
  };
};
