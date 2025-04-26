
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { handleSubscriptionChange, getSubscriptionOptions } from "@/api/user/userSubscription";
import { UserFormValues, User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  credits: z.coerce.number().min(0, { message: "Tín dụng không thể âm" }),
  subscription: z.string(),
  status: z.enum(["active", "inactive"]),
  role: z.enum(["user", "admin", "editor"])
});

export const useUserForm = (user?: User, onSubmit?: (data: UserFormValues) => Promise<void>) => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalSubscription, setOriginalSubscription] = useState<string>(user?.subscription || "Không có");
  const isMounted = useRef(true);
  const isSubmitting = useRef(false);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      credits: user.credits,
      subscription: user.subscription || "Không có",
      status: user.status,
      role: user.role
    } : {
      name: "",
      email: "",
      credits: 0,
      subscription: "Không có",
      status: "active",
      role: "user"
    }
  });

  // Reset form khi user prop thay đổi
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        credits: user.credits,
        subscription: user.subscription || "Không có",
        status: user.status,
        role: user.role
      });
      setOriginalSubscription(user.subscription || "Không có");
    } else {
      form.reset({
        name: "",
        email: "",
        credits: 0,
        subscription: "Không có",
        status: "active",
        role: "user"
      });
      setOriginalSubscription("Không có");
    }
  }, [user, form]);

  // Cleanup function khi component unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      isSubmitting.current = false;
      setIsLoading(false);
    };
  }, []);

  // Tải dữ liệu gói đăng ký
  const loadSubscriptions = useCallback(async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      const options = await getSubscriptionOptions();
      if (isMounted.current) {
        setSubscriptions(options);
        setIsLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Lỗi khi tải gói đăng ký:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách gói đăng ký",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleFormSubmit = async (data: UserFormValues) => {
    // Chặn việc submit nhiều lần
    if (isLoading || isSubmitting.current) {
      console.log("Đang xử lý, bỏ qua submit mới");
      return;
    }
    
    isSubmitting.current = true;
    setIsLoading(true);
    
    try {
      // Xử lý thay đổi gói đăng ký nếu cần
      if (user && data.subscription !== originalSubscription) {
        console.log(`Thay đổi gói đăng ký từ ${originalSubscription} thành ${data.subscription}`);
        const result = await handleSubscriptionChange(user.id.toString(), data.subscription);
        if (!result.success) {
          throw new Error(result.message);
        }
        
        if (isMounted.current) {
          toast({
            title: "Thành công",
            description: `Đã cập nhật gói đăng ký thành ${data.subscription}`,
          });
        }
      }
      
      // Gọi callback onSubmit
      if (onSubmit && isMounted.current) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
      
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu thông tin",
          variant: "destructive"
        });
      }
    } finally {
      // Reset trạng thái luôn được thực hiện, nhưng chỉ khi component còn mounted
      if (isMounted.current) {
        setIsLoading(false);
      }
      isSubmitting.current = false;
    }
  };

  return {
    form,
    subscriptions,
    isLoading,
    handleSubmit: handleFormSubmit
  };
};
