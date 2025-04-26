
import React from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { User, UserFormValues } from "@/types/user";
import { BasicInfoFields } from "./users/form-fields/BasicInfoFields";
import { SubscriptionField } from "./users/form-fields/SubscriptionField";
import { StatusField } from "./users/form-fields/StatusField";
import { RoleField } from "./users/form-fields/RoleField";
import { useUserForm } from "./users/hooks/useUserForm";

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UserForm = ({ user, onSubmit, onCancel, isSubmitting = false }: UserFormProps) => {
  const { form, subscriptions, isLoading, internalSubmitting, handleSubmit } = useUserForm(user, onSubmit);
  
  const buttonDisabled = isLoading || isSubmitting || internalSubmitting;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BasicInfoFields form={form} isDisabled={buttonDisabled} />
          <SubscriptionField form={form} subscriptions={subscriptions} isDisabled={buttonDisabled} />
          <StatusField form={form} isDisabled={buttonDisabled} />
          <RoleField form={form} isDisabled={buttonDisabled} />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={buttonDisabled}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={buttonDisabled}>
            {(isLoading || isSubmitting || internalSubmitting) && 
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            }
            {user ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
