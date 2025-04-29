
import React from "react";
import { Badge } from "@/components/ui/badge";

interface UserBadgeProps {
  role: string;
  color: string;
}

const UserBadge = ({ role, color }: UserBadgeProps) => {
  return (
    <Badge variant="outline" className={`${color} capitalize`}>
      {role}
    </Badge>
  );
};

export default UserBadge;
