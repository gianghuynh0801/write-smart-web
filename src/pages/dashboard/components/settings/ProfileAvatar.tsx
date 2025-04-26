
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  name: string;
}

export function ProfileAvatar({ name }: ProfileAvatarProps) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}` : undefined} alt="Avatar" />
        <AvatarFallback>{name ? name[0].toUpperCase() : 'U'}</AvatarFallback>
      </Avatar>
      <div>
        <Button variant="outline" size="sm">
          Thay đổi ảnh đại diện
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          JPG, GIF hoặc PNG. Tối đa 2MB.
        </p>
      </div>
    </div>
  );
}
