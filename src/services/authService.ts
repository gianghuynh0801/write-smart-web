
// File này giữ lại để đảm bảo tính tương thích ngược với mã hiện có
// sẽ chuyển tiếp các lệnh gọi đến module mới

import { authService as newAuthService, AuthError, AuthErrorType, isAuthError } from "./auth/authService";

// Re-export everything
export { AuthError, AuthErrorType };
export const authService = newAuthService;
