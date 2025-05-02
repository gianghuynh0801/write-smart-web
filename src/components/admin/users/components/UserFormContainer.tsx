
import React from "react";
import { Form } from "@/components/ui/form";
import { User, UserFormValues } from "@/types/user";
import { UseFormReturn } from "react-hook-form";
import { UserDialogActions } from "./UserDialogActions";
import { useUserFormSubmit } from "../hooks/useUserFormSubmit";

interface UserFormContainerProps {
  form: UseFormReturn<UserFormValues>;
  onSubmit: (data: UserFormValues) => Promise<void>;
  onCancel: () => void;
  children: React.ReactNode;
  isLoading: boolean;
  isSubmitting: boolean;
  user?: User;
}

export const UserFormContainer = ({
  form,
  onSubmit,
  onCancel,
  children,
  isLoading,
  isSubmitting,
  user
}: UserFormContainerProps) => {
  const { handleFormSubmit, buttonDisabled } = useUserFormSubmit({
    onSubmit,
    isLoading,
    isSubmitting
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children}
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
