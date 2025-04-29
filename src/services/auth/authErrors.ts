
// Định nghĩa các loại lỗi xác thực
export enum AuthErrorType {
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  PERMISSION_DENIED = "PERMISSION_DENIED", // Thêm loại lỗi này
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

// Class Error tùy chỉnh cho lỗi xác thực
export class AuthError extends Error {
  type: AuthErrorType;

  constructor(message: string, type: AuthErrorType = AuthErrorType.UNKNOWN_ERROR) {
    super(message);
    this.name = "AuthError";
    this.type = type;
    
    // Cài đặt prototype đúng cách khi kế thừa từ Error
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// Hàm kiểm tra một đối tượng có phải là AuthError hay không
export function isAuthError(error: any): error is AuthError {
  return (
    error instanceof AuthError || 
    (error && 
     error.name === "AuthError" && 
     typeof error.type === "string" && 
     Object.values(AuthErrorType).includes(error.type as AuthErrorType))
  );
}
