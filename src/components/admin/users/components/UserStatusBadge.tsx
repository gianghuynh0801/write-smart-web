
import React from "react";

interface UserStatusBadgeProps {
  status: string;
}

const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs";
      case "inactive":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs";
      default:
        return "bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs";
    }
  };

  return (
    <span className={getStatusClasses()}>
      {status === "active" ? "Đang hoạt động" : "Không hoạt động"}
    </span>
  );
};

export default UserStatusBadge;
