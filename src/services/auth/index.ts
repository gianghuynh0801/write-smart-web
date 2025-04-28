
// Barrel exports file - tập trung tất cả các exports từ module auth
// Điều này giúp đơn giản hóa imports và đảm bảo tính nhất quán

// Re-export từ authErrors
export { AuthError, AuthErrorType, isAuthError } from './authErrors';

// Re-export từ authService
export { authService } from './authService';

// Re-export từ adminRoleService
export { adminRoleService } from './adminRoleService';

// Export các interface có thể tái sử dụng
export interface AuthServiceInterface {
  getAdminToken(forceRefresh?: boolean): Promise<string>;
  checkAdminStatus(userId: string): Promise<boolean>;
  handleAuthError(error: any): Promise<boolean>;
}
