
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Facebook, FileText, Lock, ArrowRight, Check, X, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionProps {
  name: string;
  icon: React.ElementType;
  connected: boolean;
  connectedSince?: string;
}

const ConnectionCard = ({ name, icon: Icon, connected, connectedSince }: ConnectionProps) => {
  const { toast } = useToast();
  
  const handleConnect = () => {
    // In a real implementation, this would open OAuth2 flow
    toast({
      title: `Kết nối với ${name}`,
      description: "Đang chuyển hướng đến trang xác thực...",
    });
    
    // Simulate OAuth redirect
    setTimeout(() => {
      // window.location.href = `oauth-provider/${name.toLowerCase()}`;
      console.log(`Redirecting to ${name} OAuth...`);
    }, 1000);
  };
  
  const handleDisconnect = () => {
    // In a real implementation, this would revoke OAuth tokens
    toast({
      title: `Ngắt kết nối với ${name}`,
      description: "Tài khoản của bạn đã được ngắt kết nối.",
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-5 w-5 mr-2" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {connected ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Đã kết nối
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <X className="h-3 w-3 mr-1" />
              Chưa kết nối
            </span>
          )}
        </div>
        <CardDescription>
          {connected 
            ? `Đã kết nối từ ${connectedSince}` 
            : `Kết nối tài khoản ${name} để đăng bài viết`}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {connected ? (
          <Button variant="outline" className="w-full" onClick={handleDisconnect}>
            Ngắt kết nối
          </Button>
        ) : (
          <Button className="w-full" onClick={handleConnect}>
            Kết nối với {name}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const Connections = () => {
  const [wordpressForm, setWordpressForm] = useState({
    url: "",
    username: "",
    appPassword: ""
  });
  const { toast } = useToast();
  
  const handleWordpressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWordpressForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWordpressConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!wordpressForm.url || !wordpressForm.username || !wordpressForm.appPassword) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng nhập đầy đủ thông tin kết nối WordPress.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would validate and store WordPress credentials
    toast({
      title: "Kết nối WordPress thành công",
      description: "Tài khoản WordPress của bạn đã được kết nối.",
    });
    
    // Reset form
    setWordpressForm({
      url: "",
      username: "",
      appPassword: ""
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kết nối tài khoản</h1>
        <p className="text-gray-500">
          Kết nối tài khoản mạng xã hội và WordPress để đăng bài viết trực tiếp
        </p>
      </div>
      
      <Tabs defaultValue="wordpress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wordpress">
            <Globe className="mr-2 h-4 w-4" />
            WordPress
          </TabsTrigger>
          <TabsTrigger value="social">
            <Facebook className="mr-2 h-4 w-4" />
            Mạng xã hội
          </TabsTrigger>
          <TabsTrigger value="settings">
            <FileText className="mr-2 h-4 w-4" />
            Tài khoản đã kết nối
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wordpress" className="space-y-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Kết nối WordPress</CardTitle>
              <CardDescription>
                Nhập thông tin WordPress của bạn để kết nối và đăng bài viết trực tiếp
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleWordpressConnect}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL Website</Label>
                  <Input
                    id="url"
                    name="url"
                    placeholder="https://example.com"
                    value={wordpressForm.url}
                    onChange={handleWordpressChange}
                  />
                  <p className="text-xs text-gray-500">
                    Nhập URL đầy đủ của trang WordPress của bạn
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="admin"
                    value={wordpressForm.username}
                    onChange={handleWordpressChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appPassword">Application Password</Label>
                  <div className="relative">
                    <Input
                      id="appPassword"
                      name="appPassword"
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={wordpressForm.appPassword}
                      onChange={handleWordpressChange}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    <a 
                      href="https://wordpress.org/documentation/article/create-application-password/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Tạo Application Password
                    </a>{" "}
                    trong trang quản trị WordPress của bạn
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="flex items-center text-sm font-medium text-blue-800 mb-2">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                    </svg>
                    Hướng dẫn
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 ml-1">
                    <li>Đăng nhập vào trang quản trị WordPress của bạn</li>
                    <li>Vào Hồ sơ người dùng &gt; Bảo mật</li>
                    <li>Tạo Application Password với tên "WriteSmart"</li>
                    <li>Sao chép mật khẩu được cấp và dán vào trường bên trên</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Kết nối WordPress
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ConnectionCard
              name="Facebook"
              icon={Facebook}
              connected={false}
            />
            
            <ConnectionCard
              name="Twitter"
              icon={FileText}
              connected={true}
              connectedSince="15/04/2023"
            />
            
            <ConnectionCard
              name="TikTok"
              icon={FileText}
              connected={false}
            />
            
            <ConnectionCard
              name="LinkedIn"
              icon={FileText}
              connected={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản đã kết nối</CardTitle>
              <CardDescription>
                Quản lý các tài khoản bạn đã kết nối với WriteSmart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 p-4 font-medium border-b bg-gray-50">
                    <div>Tài khoản</div>
                    <div>Ngày kết nối</div>
                    <div>Trạng thái</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-3 p-4">
                      <div className="flex items-center">
                        <Twitter className="h-5 w-5 mr-3 text-gray-500" />
                        <span>Twitter</span>
                      </div>
                      <div className="text-gray-500">15/04/2023</div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Empty state when no connections */}
                {false && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Không có tài khoản nào</h3>
                    <p className="text-gray-500 mb-4">
                      Bạn chưa kết nối bất kỳ tài khoản nào với WriteSmart
                    </p>
                    <Button>
                      Kết nối tài khoản
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Connections;
