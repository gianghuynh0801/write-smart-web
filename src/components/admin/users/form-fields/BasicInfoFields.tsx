
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@/types/user";

interface BasicInfoFieldsProps {
  form: UseFormReturn<UserFormValues>;
  isDisabled: boolean;
}

export const BasicInfoFields = ({ form, isDisabled }: BasicInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên</FormLabel>
            <FormControl>
              <Input placeholder="Nhập tên người dùng" {...field} disabled={isDisabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="email@example.com" type="email" {...field} disabled={isDisabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="credits"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tín dụng</FormLabel>
            <FormControl>
              <Input placeholder="0" type="number" {...field} disabled={isDisabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
