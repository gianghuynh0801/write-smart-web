
export interface User {
  id: string | number;
  name: string;
  email: string;
  credits: number;
  subscription: string;
  status: "active" | "inactive";
  registeredAt: string;
  avatar: string;
  role: "user" | "admin" | "editor";
  email_verified?: boolean;
}

export interface UserFormValues {
  name: string;
  email: string;
  credits: number;
  subscription: string;
  status: "active" | "inactive";
  role: "user" | "admin" | "editor";
  email_verified?: boolean;
}
