
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  // State để áp dụng hiệu ứng shadow khi sticky
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`bg-white transition-all duration-300 z-30 sticky top-0 w-full ${scrolled ? "shadow-lg animate-fade-in" : "shadow-sm"} animate-fade-in`}>
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <a href="/" className="font-bold text-primary text-xl">
            WriteSmart
          </a>
          <ul className="hidden md:flex gap-4">
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("features")}>
                {t('common:features')}
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("pricing")}>
                {t('common:pricing')}
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("contact")}>
                {t('common:contact')}
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a href="/login" className="btn btn-sm btn-outline-primary">{t('common:login')}</a>
          <a href="/register" className="btn btn-sm btn-primary">{t('common:register')}</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
