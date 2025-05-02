
import React from "react";
import { Form } from "@/components/ui/form";
import { User, UserFormValues } from "@/types/user";
import { BasicInfoFields } from "./users/form-fields/BasicInfoFields";
import { SubscriptionField } from "./users/form-fields/SubscriptionField";
import { StatusField } from "./users/form-fields/StatusField";
import { RoleField } from "./users/form-fields/RoleField";
import { useUserForm } from "./users/hooks/useUserForm";
import { UserDialogActions } from "./users/components/UserDialogActions";

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UserForm = ({ user, onSubmit, onCancel, isSubmitting = false }: UserFormProps) => {
  const { form, subscriptions, isLoading } = useUserForm(user);
  
  const buttonDisabled = isLoading || isSubmitting;
  
  const handleFormSubmit = async (data: UserFormValues) => {
    if (buttonDisabled) return;
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BasicInfoFields form={form} isDisabled={buttonDisabled} />
          <SubscriptionField form={form} subscriptions={subscriptions} isDisabled={buttonDisabled} />
          <StatusField form={form} isDisabled={buttonDisabled} />
          <RoleField form={form} isDisabled={buttonDisabled} />
        </div>
        
        <UserDialogActions 
          onCancel={onCancel} 
          isSubmitting={isSubmitting}
          isUpdate={!!user}
        />
      </form>
    </Form>
  );
};

export default UserForm;
