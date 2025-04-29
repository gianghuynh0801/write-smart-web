
import { Session, User } from "@supabase/supabase-js";

export interface UserDetails {
  credits?: number;
  subscription?: string;
  email_verified?: boolean;
  subscription_end_date?: string;
  subscription_status?: string;
  [key: string]: any;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null;
  isAdmin: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  updateUserDetails: (details: UserDetails) => void;
  fetchUserDetails: (userId?: string) => Promise<UserDetails | null>;
}
