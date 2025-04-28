
import { User } from "@/types/user";

export function parseUser(row: any): User {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    credits: row.credits ?? 0,
    subscription: row.subscription ?? "Không có",
    status: row.status === "inactive" ? "inactive" : "active",
    registeredAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    avatar: row.avatar || `https://i.pravatar.cc/150?u=${row.id}`,
    role: row.role === "admin" || row.role === "editor" ? row.role : "user",
    email_verified: !!row.email_verified
  };
}
