
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteAccount() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xóa tài khoản</CardTitle>
        <CardDescription>
          Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm mb-4">
          Khi bạn xóa tài khoản của mình, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.
          Hãy chắc chắn bạn đã sao lưu bất kỳ dữ liệu nào bạn muốn giữ lại.
        </p>
        <Button variant="destructive">
          Xóa tài khoản
        </Button>
      </CardContent>
    </Card>
  );
}
