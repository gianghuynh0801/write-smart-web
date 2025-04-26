
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@/types/user";

interface SubscriptionFieldProps {
  form: UseFormReturn<UserFormValues>;
  subscriptions: string[];
  isDisabled: boolean;
}

export const SubscriptionField = ({ form, subscriptions, isDisabled }: SubscriptionFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="subscription"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gói đăng ký</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDisabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Chọn gói đăng ký" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subscriptions.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
