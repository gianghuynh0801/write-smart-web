
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSubscriptionOptions } from "@/api/user/userSubscription";
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

export const useUserForm = (user?: User) => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    } else {
      form.reset({
        name: "",
        email: "",
        credits: 0,
        subscription: "Không có",
        status: "active",
        role: "user"
      });
    }
  }, [user, form]);

  // Tải dữ liệu gói đăng ký
  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const options = await getSubscriptionOptions();
      setSubscriptions(options);
    } catch (error) {
      console.error("Lỗi khi tải gói đăng ký:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gói đăng ký",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return {
    form,
    subscriptions,
    isLoading
  };
};
