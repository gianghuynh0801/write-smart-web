import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "@/utils/i18n";

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
            {t("app.name")}
          </a>
          <ul className="hidden md:flex gap-4">
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("features")}>
                {t("nav.features")}
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("pricing")}>
                {t("nav.pricing")}
              </button>
            </li>
            <li>
              <button className="bg-transparent hover:underline px-2" onClick={() => scrollToSection("contact")}>
                {t("nav.contact")}
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a href="/login" className="btn btn-sm btn-outline-primary">{t("nav.login")}</a>
          <a href="/register" className="btn btn-sm btn-primary">{t("nav.register")}</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
