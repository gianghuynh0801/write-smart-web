
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Check, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const creditPackages = [
  {
    id: "credits-10",
    name: "Gói 10 tín dụng",
    price: "99.000",
    description: "Phù hợp cho việc thử nghiệm",
    features: [
      "10 tín dụng",
      "Không giới hạn thời gian sử dụng",
      "Hỗ trợ qua email"
    ]
  },
  {
    id: "credits-50",
    name: "Gói 50 tín dụng",
    price: "399.000",
    description: "Phổ biến nhất",
    features: [
      "50 tín dụng",
      "Không giới hạn thời gian sử dụng",
      "Hỗ trợ ưu tiên",
      "Giảm 20% so với mua lẻ"
    ],
    popular: true
  },
  {
    id: "credits-100",
    name: "Gói 100 tín dụng",
    price: "699.000",
    description: "Tiết kiệm nhất",
    features: [
      "100 tín dụng",
      "Không giới hạn thời gian sử dụng",
      "Hỗ trợ ưu tiên",
      "Giảm 30% so với mua lẻ"
    ]
  }
];

const paymentMethods = [
  { id: "card", name: "Thẻ tín dụng / Thẻ ghi nợ", icon: CreditCard },
  { id: "momo", name: "Ví MoMo", icon: CreditCard },
  { id: "vnpay", name: "VNPAY", icon: CreditCard }
];

const Credits = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = () => {
    if (!selectedPackage) {
      toast({
        title: "Vui lòng chọn gói tín dụng",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive",
      });
      return;
    }

    // Here would be the integration with Stripe or other payment gateways
    toast({
      title: "Đang chuyển đến trang thanh toán",
      description: "Bạn sẽ được chuyển đến trang thanh toán trong giây lát."
    });

    // Simulate redirect to payment page
    setTimeout(() => {
      // window.location.href = '/payment-gateway';
      console.log("Redirecting to payment gateway...");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tín dụng</h1>
        <p className="text-gray-500">
          Quản lý và mua tín dụng cho tài khoản của bạn
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tín dụng hiện tại</CardTitle>
          <CardDescription>
            Số tín dụng hiện có và thông tin sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
            <div>
              <h3 className="font-medium">Tín dụng khả dụng</h3>
              <p className="text-gray-500 text-sm">Cập nhật gần nhất: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-3xl font-bold text-primary">48</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Thông tin sử dụng</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Đã sử dụng tháng này:</span>
                  <span>12 tín dụng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Đã mua tổng cộng:</span>
                  <span>60 tín dụng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tín dụng miễn phí:</span>
                  <span>0 tín dụng</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Chi tiết giao dịch gần đây</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mua 50 tín dụng</span>
                  <span className="text-gray-500">14/04/2023</span>
                </div>
                <div className="flex justify-between">
                  <span>Sử dụng 2 tín dụng</span>
                  <span className="text-gray-500">12/04/2023</span>
                </div>
                <div className="flex justify-between">
                  <span>Mua 10 tín dụng</span>
                  <span className="text-gray-500">05/04/2023</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mua thêm tín dụng</CardTitle>
          <CardDescription>
            Chọn gói tín dụng phù hợp với nhu cầu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="purchase" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchase">Mua tín dụng</TabsTrigger>
              <TabsTrigger value="history">Lịch sử giao dịch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchase" className="space-y-6 pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`relative overflow-hidden cursor-pointer transition-all ${
                      selectedPackage === pkg.id 
                        ? 'ring-2 ring-primary' 
                        : 'hover:shadow-md'
                    } ${pkg.popular ? 'shadow-md' : ''}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg">
                        Phổ biến
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-4">
                        <span className="text-2xl font-bold">{pkg.price}đ</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {selectedPackage === pkg.id ? (
                        <div className="w-full p-2 bg-primary/10 text-primary font-medium rounded-md text-center">
                          Đã chọn
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedPackage(pkg.id)}
                        >
                          Chọn gói
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {selectedPackage && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Chọn phương thức thanh toán</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>{method.name}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    className="w-full mt-6" 
                    size="lg" 
                    onClick={handlePurchase}
                  >
                    Tiến hành thanh toán
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="pt-6">
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
                  <div>Loại giao dịch</div>
                  <div>Số lượng</div>
                  <div>Ngày</div>
                  <div>Trạng thái</div>
                </div>
                <div className="divide-y">
                  {[
                    { type: "Mua tín dụng", amount: "+50", date: "14/04/2023", status: "Hoàn tất" },
                    { type: "Sử dụng tín dụng", amount: "-2", date: "12/04/2023", status: "Hoàn tất" },
                    { type: "Mua tín dụng", amount: "+10", date: "05/04/2023", status: "Hoàn tất" },
                    { type: "Sử dụng tín dụng", amount: "-3", date: "01/04/2023", status: "Hoàn tất" },
                    { type: "Tín dụng miễn phí", amount: "+5", date: "28/03/2023", status: "Hoàn tất" }
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-4 p-4">
                      <div>{item.type}</div>
                      <div className={item.amount.startsWith("+") ? "text-green-600" : "text-red-600"}>
                        {item.amount} tín dụng
                      </div>
                      <div className="text-gray-500">{item.date}</div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Credits;
