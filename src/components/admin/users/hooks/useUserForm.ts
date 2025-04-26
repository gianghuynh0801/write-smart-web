
import { useState, useEffect } from "react";
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
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [originalSubscription, setOriginalSubscription] = useState<string>(user?.subscription || "Không có");
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

  useEffect(() => {
    if (user) {
      setOriginalSubscription(user.subscription || "Không có");
    }
    
    const loadSubscriptions = async () => {
      setIsLoading(true);
      try {
        const options = await getSubscriptionOptions();
        setSubscriptions(options);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách gói đăng ký",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscriptions();
  }, [toast, user]);

  const handleFormSubmit = async (data: UserFormValues) => {
    if (internalSubmitting) return;
    
    setInternalSubmitting(true);
    try {
      if (user && data.subscription !== originalSubscription) {
        console.log(`Thay đổi gói đăng ký từ ${originalSubscription} thành ${data.subscription}`);
        const result = await handleSubscriptionChange(user.id.toString(), data.subscription);
        if (!result.success) {
          throw new Error(result.message);
        }
        toast({
          title: "Thành công",
          description: `Đã cập nhật gói đăng ký thành ${data.subscription}`,
        });
      }
      
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu thông tin",
        variant: "destructive"
      });
    } finally {
      setInternalSubmitting(false);
    }
  };

  return {
    form,
    subscriptions,
    isLoading,
    internalSubmitting,
    handleSubmit: handleFormSubmit
  };
};
