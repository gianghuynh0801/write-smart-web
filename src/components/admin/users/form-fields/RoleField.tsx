
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@/types/user";

interface RoleFieldProps {
  form: UseFormReturn<UserFormValues>;
  isDisabled: boolean;
}

export const RoleField = ({ form, isDisabled }: RoleFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Vai trò</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <FormLabel htmlFor="user" className="font-normal">
                  Người dùng
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="editor" id="editor" />
                <FormLabel htmlFor="editor" className="font-normal">
                  Biên tập viên
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <FormLabel htmlFor="admin" className="font-normal">
                  Quản trị viên
                </FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
