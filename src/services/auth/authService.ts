
import { tokenManager } from "@/utils/tokenManager";
import { AuthError, AuthErrorType, isAuthError } from "./authErrors";
import { adminRoleService } from "./adminRoleService";

class AuthService {
  private static instance: AuthService;
  
  private constructor() {}

  // Singleton pattern
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Lấy token admin với các cơ chế retry và refresh
  public async getAdminToken(forceRefresh = false): Promise<string> {
    try {
      console.log("[AuthService] Đang lấy admin token...");

      // Nếu yêu cầu làm mới token
      if (forceRefresh) {
        console.log("[AuthService] Làm mới token theo yêu cầu");
        const refreshedToken = await tokenManager.refreshToken();
        if (!refreshedToken) {
          throw new AuthError(
            "Không thể làm mới token, vui lòng đăng nhập lại",
            AuthErrorType.TOKEN_EXPIRED
          );
        }
        return refreshedToken;
      }

      // Lấy token hiện tại
      const currentToken = await tokenManager.getToken();
      if (!currentToken) {
        console.log("[AuthService] Không có token hiện tại, thử làm mới");
        const newToken = await tokenManager.refreshToken();
        if (!newToken) {
          throw new AuthError(
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
            AuthErrorType.TOKEN_EXPIRED
          );
        }
        return newToken;
      }

      // Xác thực token hiện tại
      const isValid = await tokenManager.validateToken(currentToken);
      if (!isValid) {
        console.log("[AuthService] Token hiện tại không hợp lệ, thử làm mới");
        const refreshedToken = await tokenManager.refreshToken();
        if (!refreshedToken) {
          throw new AuthError(
            "Token không hợp lệ và không thể làm mới",
            AuthErrorType.TOKEN_EXPIRED
          );
        }
        return refreshedToken;
      }

      return currentToken;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error("[AuthService] Lỗi không xác định khi lấy admin token:", error);
      throw new AuthError(
        "Không thể lấy token xác thực",
        AuthErrorType.UNKNOWN_ERROR
      );
    }
  }

  // Kiểm tra quyền admin (sử dụng adminRoleService)
  public async checkAdminStatus(userId: string): Promise<boolean> {
    return adminRoleService.checkAdminStatus(userId);
  }

  // Xử lý lỗi xác thực
  public async handleAuthError(error: any): Promise<boolean> {
    if (isAuthError(error)) {
      console.log("[AuthService] Phát hiện lỗi xác thực, đang thử làm mới token...");
      const newToken = await tokenManager.refreshToken();
      return !!newToken;
    }
    return false;
  }
}

// Re-export các hàm và types cần thiết
export { AuthError, AuthErrorType, isAuthError };

// Xuất instance singleton
export const authService = AuthService.getInstance();
