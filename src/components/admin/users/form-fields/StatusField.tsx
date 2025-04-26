
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@/types/user";

interface StatusFieldProps {
  form: UseFormReturn<UserFormValues>;
  isDisabled: boolean;
}

export const StatusField = ({ form, isDisabled }: StatusFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Trạng thái</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <FormLabel htmlFor="active" className="font-normal">
                  Hoạt động
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <FormLabel htmlFor="inactive" className="font-normal">
                  Không hoạt động
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
