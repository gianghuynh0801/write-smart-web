
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Settings,
  CreditCard,
  Package,
  LogOut,
  Menu,
  X,
  Home,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Tổng quan", href: "/admin", icon: BarChart3 },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Tín dụng", href: "/admin/credits", icon: CreditCard },
  { name: "Gói đăng ký", href: "/admin/subscriptions", icon: Package },
  { name: "Cấu hình", href: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
  const isActiveRoute = (href: string) => {
    return location.pathname === href || 
           (href !== "/admin" && location.pathname.startsWith(href));
  };

  const handleLogout = () => {
    // Implementation of logout with Supabase Auth
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi tài khoản admin."
    });
    // In a real implementation, this would redirect to the login page
    // window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar for large screens and mobile (when open) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-gray-800">
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </Link>
          </div>
          
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActiveRoute(item.href)
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-gray-400">admin@writesmart.vn</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-300 border-gray-700 hover:bg-gray-800"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Trang chủ
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-gray-300 border-gray-700 hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="lg:pl-64">
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold text-gray-900">
              {navigation.find(item => isActiveRoute(item.href))?.name || "Admin Panel"}
            </h1>
            <div className="flex items-center gap-4">
              {/* Add additional header elements here like notifications */}
            </div>
          </div>
        </header>
        
        <main className="py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
