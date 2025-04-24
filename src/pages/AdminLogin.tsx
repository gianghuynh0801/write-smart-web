
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginForm } from "@/components/admin/LoginForm";

const AdminLogin = () => {
  const { isLoading, isChecking, handleAdminLogin } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm onSubmit={handleAdminLogin} isLoading={isLoading} />
    </div>
  );
};

export default AdminLogin;
