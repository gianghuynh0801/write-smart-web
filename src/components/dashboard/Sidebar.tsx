
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  FileText, 
  CreditCard, 
  Package, 
  Settings, 
  Link2, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: BarChart3 },
  { name: "Bài viết", href: "/dashboard/articles", icon: FileText },
  { name: "Tạo nội dung", href: "/dashboard/create", icon: FileText },
  { name: "Tín dụng", href: "/dashboard/credits", icon: CreditCard },
  { name: "Gói đăng ký", href: "/dashboard/subscriptions", icon: Package },
  { name: "Kết nối tài khoản", href: "/dashboard/connections", icon: Link2 },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser({
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          email: currentUser.email
        });
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống"
      });
    } catch (error) {
      toast({
        title: "Lỗi đăng xuất",
        description: "Không thể đăng xuất. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const isActiveRoute = (href: string) => {
    return location.pathname === href || 
           (href !== "/dashboard" && location.pathname.startsWith(href));
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">WriteSmart</span>
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
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {user.name || 'Người dùng'}
                </div>
                <div className="text-xs text-gray-500">
                  {user.email || 'user@example.com'}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
