
// Định nghĩa các loại lỗi xác thực
export enum AuthErrorType {
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

// Class lỗi xác thực tùy chỉnh
export class AuthError extends Error {
  type: AuthErrorType;
  
  constructor(message: string, type: AuthErrorType) {
    super(message);
    this.name = "AuthError";
    this.type = type;
  }
}

/**
 * Kiểm tra lỗi xác thực từ API response
 * @param error Lỗi cần kiểm tra
 * @returns true nếu là lỗi xác thực, false nếu không phải
 */
export const isAuthError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMsg = error instanceof Error ? 
    error.message.toLowerCase() : 
    String(error).toLowerCase();
  
  return errorMsg.includes('xác thực') || 
         errorMsg.includes('phiên đăng nhập') ||
         errorMsg.includes('token') || 
         errorMsg.includes('auth') ||
         errorMsg.includes('unauthorized') ||
         errorMsg.includes('401') || 
         errorMsg.includes('403');
}
