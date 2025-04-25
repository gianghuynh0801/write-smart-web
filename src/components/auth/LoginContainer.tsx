
import { ReactNode } from "react";

interface LoginContainerProps {
  children: ReactNode;
}

const LoginContainer = ({ children }: LoginContainerProps) => {
  return (
    <div className="flex-grow flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default LoginContainer;
