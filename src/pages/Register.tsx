
import { Link } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
            <p className="text-gray-600 mt-2">
              Tham gia WriteSmart và bắt đầu tạo nội dung chất lượng
            </p>
          </div>
          
          <RegisterForm />
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
