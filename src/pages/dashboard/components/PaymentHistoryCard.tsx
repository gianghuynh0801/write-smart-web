
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const PaymentHistoryCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Lịch sử thanh toán</CardTitle>
      <CardDescription>
        Lịch sử các giao dịch thanh toán gói đăng ký của bạn
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
          <div>Hóa đơn</div>
          <div>Ngày</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
        </div>
        <div className="divide-y">
          {[
            { id: "INV-001", date: "15/04/2023", amount: "499.000đ", status: "Thành công" },
            { id: "INV-002", date: "15/03/2023", amount: "499.000đ", status: "Thành công" },
            { id: "INV-003", date: "15/02/2023", amount: "499.000đ", status: "Thành công" }
          ].map((invoice, i) => (
            <div key={i} className="grid grid-cols-4 p-4">
              <div className="font-medium">{invoice.id}</div>
              <div className="text-gray-500">{invoice.date}</div>
              <div>{invoice.amount}</div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full md:w-auto">
        <Package className="mr-2 h-4 w-4" />
        Xem tất cả hóa đơn
      </Button>
    </CardFooter>
  </Card>
);

export default PaymentHistoryCard;
