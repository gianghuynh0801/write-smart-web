
import React, { createContext, useContext } from "react";
import { useAuthSession } from "./useAuthSession";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType, AuthState } from "./types";

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
    fetchUserDetails, 
    checkAdminStatus, 
    refreshSession 
  } = useAuthSession();
  
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
