
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
                <Home size={18} />
                <span className="ml-2 text-sm">Trang chủ</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {/* Add additional header elements here like notifications */}
            </div>
          </div>
        </header>
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
