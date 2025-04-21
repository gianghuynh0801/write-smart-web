
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <a href="/" className="font-bold text-primary text-xl">
            WriteSmart
          </a>
          <ul className="hidden md:flex gap-4">
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("features")}>
                Tính năng
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("pricing")}>
                Bảng giá
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("contact")}>
                Liên hệ
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="btn btn-sm btn-outline-primary">Đăng nhập</a>
          <a href="/register" className="btn btn-sm btn-primary">Đăng ký</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
