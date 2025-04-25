
import { Link } from "react-router-dom";

const AuthLinks = () => {
  return (
    <div className="text-center mt-4">
      <p className="text-gray-600">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default AuthLinks;
