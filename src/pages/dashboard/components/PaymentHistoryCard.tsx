
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentHistory } from "@/types/subscriptions";

const PaymentHistoryCard = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setIsLoading(true);
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const { data, error } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', user.id as any)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        // Transform the data to match our PaymentHistory interface
        const transformedData = data?.map(item => ({
          ...item,
          payment_at: item.payment_at || item.created_at // Sử dụng payment_at nếu có, nếu không thì dùng created_at
        })) || [];
        
        setPayments(transformedData as PaymentHistory[]);
      } catch (error: any) {
        console.error("Error fetching payment history:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch sử thanh toán",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [toast]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };
  
  const formatAmount = (amount: number) => {
    return amount ? amount.toLocaleString() + 'đ' : '0đ';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử thanh toán</CardTitle>
        <CardDescription>
          Lịch sử các giao dịch thanh toán gói đăng ký của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
              <div>Hóa đơn</div>
              <div>Ngày</div>
              <div>Số tiền</div>
              <div>Trạng thái</div>
            </div>
            <div className="divide-y">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="grid grid-cols-4 p-4">
                    <div className="font-medium">INV-{(payment.id && typeof payment.id === 'string') ? 
                      payment.id.toString().substring(0, 3).padStart(3, '0') : '000'}</div>
                    <div className="text-gray-500">{formatDate(payment.payment_at || '')}</div>
                    <div>{formatAmount(payment.amount || 0)}</div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'success' ? 'Thành công' : payment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Không có dữ liệu thanh toán
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full md:w-auto">
          <Package className="mr-2 h-4 w-4" />
          Xem tất cả hóa đơn
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentHistoryCard;
