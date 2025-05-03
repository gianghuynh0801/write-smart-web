
import React, { createContext, useContext } from "react";
import { useAuthSession } from "./useAuthSession";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType, AuthState } from "./types";
import { adminRoleService } from "@/services/auth/adminRoleService";
import { supabase } from "@/integrations/supabase/client"; // Thêm import này

const initialAuthState: AuthState = {
  session: null,
  user: null,
  userDetails: null,
  isAdmin: false,
  isLoading: true,
  isChecking: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => false,
  checkAdminStatus: async () => false,
  updateUserDetails: () => {},
  fetchUserDetails: async () => null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    state, 
    setState,
    updateUserDetails, 
    fetchUserDetails
  } = useAuthSession();
  
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Sử dụng AdminRoleService để kiểm tra quyền admin
      return await adminRoleService.checkAdminStatus(userId);
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền admin:", error);
      return false;
    }
  };
  
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error("Lỗi khi làm mới session:", error);
        return false;
      }
      
      // Cập nhật state với session mới
      setState(prev => ({
        ...prev,
        session: data.session,
        user: data.session.user
      }));
      
      // Kiểm tra lại quyền admin với user id mới
      if (data.session.user) {
        const isAdmin = await checkAdminStatus(data.session.user.id);
        setState(prev => ({ ...prev, isAdmin }));
      }
      
      return true;
    } catch (error) {
      console.error("Lỗi không mong đợi khi làm mới session:", error);
      return false;
    }
  };
  
  const { login, logout } = useAuthActions({
    state,
    setState,
    checkAdminStatus,
    fetchUserDetails
  });
  
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    checkAdminStatus,
    updateUserDetails,
    fetchUserDetails
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
