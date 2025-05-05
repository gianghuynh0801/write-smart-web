
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCcw, AlertTriangle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { adminUserService } from "@/services/auth/adminUserService";
import { supabase } from "@/integrations/supabase/client";

interface UserItem {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

const AdminSetupPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Tải danh sách người dùng từ bảng seo_project.users thay vì users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('seo_project.users')
        .select('id, email, name, role')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Lỗi khi tải danh sách users:", error);
        
        // Thử tải từ bảng auth.users nếu không thể tải từ seo_project.users
        try {
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError || !authUsers) {
            setError("Không thể tải danh sách người dùng");
            return;
          }
          
          const formattedUsers = authUsers.users.map(user => ({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
            role: 'user'
          }));
          
          setUsers(formattedUsers);
          
        } catch (fallbackErr) {
          console.error("Lỗi khi tải danh sách auth.users:", fallbackErr);
          setError("Không thể tải danh sách người dùng");
        }
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Lỗi không mong đợi:", err);
      setError("Đã xảy ra lỗi không mong đợi");
    } finally {
      setLoading(false);
    }
  };

  // Thiết lập một user làm admin chính
  const setupPrimaryAdmin = async (userId: string) => {
    if (processingId) return;

    setProcessingId(userId);
    try {
      const result = await adminUserService.setAsPrimaryAdmin(userId);

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã thiết lập tài khoản quản trị chính",
        });
        
        // Làm mới danh sách để hiển thị vai trò mới
        await fetchUsers();
        
        // Chuyển hướng đến trang admin
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể thiết lập tài khoản quản trị chính",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Lỗi khi thiết lập admin:", err);
      toast({
        title: "Lỗi hệ thống",
        description: "Đã xảy ra lỗi không mong đợi",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Thiết lập tài khoản quản trị chính</CardTitle>
          </div>
          <CardDescription>
            Chọn một người dùng từ danh sách để thiết lập làm tài khoản quản trị chính cho hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border p-4 rounded-md">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">Không tìm thấy người dùng nào trong hệ thống</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchUsers()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between border p-4 rounded-md ${user.role === 'admin' ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {user.email}
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.name || "Chưa có tên"}
                    </div>
                  </div>
                  <Button 
                    variant={user.role === 'admin' ? "outline" : "default"}
                    size="sm"
                    disabled={processingId !== null}
                    onClick={() => setupPrimaryAdmin(user.id)}
                  >
                    {processingId === user.id ? (
                      <>
                        <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : user.role === 'admin' ? (
                      "Đã là Admin"
                    ) : (
                      "Thiết lập làm Admin"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại danh sách
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSetupPage;
