
import React from "react";
import { Button } from "@/components/ui/button";

interface ResendVerificationButtonProps {
  email: string;
  isLoading: boolean;
  onResend: () => void;
}

const ResendVerificationButton: React.FC<ResendVerificationButtonProps> = ({
  email,
  isLoading,
  onResend
}) => {
  if (!email) return null;
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onResend}
      disabled={isLoading}
      className="mt-2"
    >
      Gửi lại email xác thực
    </Button>
  );
};

export default ResendVerificationButton;
