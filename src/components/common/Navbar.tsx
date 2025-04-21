
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          WriteSmart
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-primary transition-colors">
            Bảng giá
          </Link>
          <Link to="/features" className="text-gray-700 hover:text-primary transition-colors">
            Tính năng
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
            Liên hệ
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline">Đăng nhập</Button>
          </Link>
          <Link to="/register">
            <Button>Đăng ký</Button>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden container mt-4 pb-4 flex flex-col gap-4">
          <Link 
            to="/"
            className="text-gray-700 py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Trang chủ
          </Link>
          <Link 
            to="/pricing"
            className="text-gray-700 py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Bảng giá
          </Link>
          <Link 
            to="/features"
            className="text-gray-700 py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Tính năng
          </Link>
          <Link 
            to="/contact"
            className="text-gray-700 py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Liên hệ
          </Link>
          <div className="flex flex-col gap-2 mt-2">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full">Đăng nhập</Button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Đăng ký</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
