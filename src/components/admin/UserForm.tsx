
import React from "react";
import { User, UserFormValues } from "@/types/user";
import { BasicInfoFields } from "./users/form-fields/BasicInfoFields";
import { SubscriptionField } from "./users/form-fields/SubscriptionField";
import { StatusField } from "./users/form-fields/StatusField";
import { RoleField } from "./users/form-fields/RoleField";
import { useUserForm } from "./users/hooks/useUserForm";
import { UserFormContainer } from "./users/components/UserFormContainer";

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UserForm = ({ user, onSubmit, onCancel, isSubmitting = false }: UserFormProps) => {
  const { form, subscriptions, isLoading } = useUserForm(user);
  
  const buttonDisabled = isLoading || isSubmitting;
  
  return (
    <UserFormContainer 
      form={form} 
      onSubmit={onSubmit} 
      onCancel={onCancel} 
      isLoading={isLoading} 
      isSubmitting={isSubmitting}
      user={user}
    >
      <BasicInfoFields form={form} isDisabled={buttonDisabled} />
      <SubscriptionField form={form} subscriptions={subscriptions} isDisabled={buttonDisabled} />
      <StatusField form={form} isDisabled={buttonDisabled} />
      <RoleField form={form} isDisabled={buttonDisabled} />
    </UserFormContainer>
  );
};

export default UserForm;
