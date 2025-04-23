import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, PencilIcon, Trash2Icon, PlusIcon, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  period: string;
  features: string[] | null;
}

interface FormValues {
  id?: number;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string;
}

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<FormValues>({
    name: "",
    description: "",
    price: 0,
    period: "tháng",
    features: "",
  });
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("price", { ascending: true });
        
      if (error) throw error;
      
      const transformedData: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        features: Array.isArray(plan.features) 
          ? plan.features 
          : typeof plan.features === 'string' 
            ? [plan.features] 
            : plan.features ? JSON.parse(JSON.stringify(plan.features)) : []
      }));
      
      setPlans(transformedData);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu gói đăng ký: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddNew = () => {
    setCurrentPlan({
      name: "",
      description: "",
      price: 0,
      period: "tháng",
      features: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setCurrentPlan({
      id: plan.id,
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      period: plan.period,
      features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setSelectedPlanId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlanId) return;
    
    try {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", selectedPlanId);
        
      if (error) throw error;
      
      toast({
        title: "Thành công",
        description: "Đã xóa gói đăng ký",
      });
      
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa gói đăng ký: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPlan((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentPlan.name.trim()) {
        throw new Error("Tên gói không được để trống");
      }

      if (currentPlan.price < 0) {
        throw new Error("Giá gói phải lớn hơn hoặc bằng 0");
      }

      const featuresArray = currentPlan.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);

      const planData = {
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        period: currentPlan.period,
        features: featuresArray,
      };

      let error;
      
      if (currentPlan.id) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(planData)
          .eq("id", currentPlan.id);
          
        error = updateError;
        
        if (!error) {
          toast({
            title: "Thành công",
            description: "Đã cập nhật gói đăng ký",
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert([planData]);
          
        error = insertError;
        
        if (!error) {
          toast({
            title: "Thành công",
            description: "Đã thêm gói đăng ký mới",
          });
        }
      }
      
      if (error) throw error;
      
      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString() + "đ";
  };

  const formatFeatures = (features: string[] | null) => {
    if (!features || features.length === 0) return "Không có";
    return (
      <ul className="list-disc list-inside space-y-1">
        {features.slice(0, 3).map((feature, index) => (
          <li key={index} className="text-sm">{feature}</li>
        ))}
        {features.length > 3 && (
          <li className="text-sm text-gray-500">
            +{features.length - 3} tính năng khác...
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý gói đăng ký</h1>
          <p className="text-gray-500">
            Thêm, sửa và xóa các gói đăng ký của ứng dụng
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách các gói đăng ký</CardTitle>
          <CardDescription>
            {plans.length} gói đăng ký có sẵn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Chưa có gói đăng ký nào</h3>
              <p className="text-gray-500 mt-2 mb-4">
                Thêm gói đăng ký để người dùng có thể đăng ký sử dụng dịch vụ của bạn.
              </p>
              <Button onClick={handleAddNew}>Thêm gói đăng ký</Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên gói</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Tính năng</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.description || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={plan.price === 0 ? "secondary" : "default"}>
                          {formatPrice(plan.price)}/{plan.period}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFeatures(plan.features)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(plan)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {currentPlan.id ? "Chỉnh sửa gói đăng ký" : "Thêm gói đăng ký mới"}
            </DialogTitle>
            <DialogDescription>
              {currentPlan.id
                ? "Cập nhật thông tin gói đăng ký"
                : "Điền thông tin để tạo gói đăng ký mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Tên gói
              </label>
              <Input
                id="name"
                name="name"
                value={currentPlan.name}
                onChange={handleInputChange}
                placeholder="Gói Cơ bản"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Mô tả
              </label>
              <Input
                id="description"
                name="description"
                value={currentPlan.description}
                onChange={handleInputChange}
                placeholder="Mô tả ngắn về gói đăng ký"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right">
                Giá (VNĐ)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={currentPlan.price}
                onChange={handleInputChange}
                placeholder="199000"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="period" className="text-right">
                Chu kỳ
              </label>
              <Input
                id="period"
                name="period"
                value={currentPlan.period}
                onChange={handleInputChange}
                placeholder="tháng"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="features" className="text-right pt-2">
                Tính năng
              </label>
              <div className="col-span-3">
                <Textarea
                  id="features"
                  name="features"
                  value={currentPlan.features}
                  onChange={handleInputChange}
                  placeholder="Mỗi tính năng một dòng&#10;10 bài viết mỗi tháng&#10;Tối đa 1.000 từ mỗi bài&#10;Hỗ trợ qua email"
                  className="h-32"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mỗi tính năng nhập một dòng
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSubmit}>
              {currentPlan.id ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa gói đăng ký</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa gói đăng ký này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">
              Lưu ý: Xóa gói đăng ký có thể ảnh hưởng đến người dùng đang sử dụng gói này.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
