
export interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  subscription: string;
  status: "active" | "inactive";
  registeredAt: string;
  avatar?: string;
  role: "user" | "admin" | "editor";
}

export interface UserFormValues {
  name: string;
  email: string;
  credits: number;
  subscription: string;
  status: "active" | "inactive";
  role: "user" | "admin" | "editor";
}
