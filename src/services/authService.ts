
import { tokenManager } from "@/utils/tokenManager";
import { supabase } from "@/integrations/supabase/client";

// Định nghĩa các loại lỗi cụ thể
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

// Cache admin role check
interface AdminCheckResult {
  isAdmin: boolean;
  timestamp: number;
  userId: string;
}

class AuthService {
  private static instance: AuthService;
  private adminCheckCache: Record<string, AdminCheckResult> = {};
  private ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 phút
  
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

  // Kiểm tra quyền admin với cache
  public async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      // Kiểm tra cache
      const cached = this.adminCheckCache[userId];
      const now = Date.now();
      
      if (cached && now - cached.timestamp < this.ADMIN_CACHE_TTL) {
        console.log("[AuthService] Sử dụng kết quả kiểm tra admin từ cache");
        return cached.isAdmin;
      }

      console.log("[AuthService] Kiểm tra quyền admin cho user:", userId);
      
      // Kiểm tra từ nhiều nguồn để đảm bảo kết quả chính xác
      // 1. Thử RPC function
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: userId });
        
        if (!rpcError && isAdmin === true) {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AuthService] Lỗi khi gọi RPC is_admin:", err);
      }
      
      // 2. Kiểm tra từ bảng user_roles
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleError && roleData) {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AuthService] Lỗi khi kiểm tra bảng user_roles:", err);
      }
      
      // 3. Kiểm tra từ trường role trong bảng users
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (!userError && userData?.role === 'admin') {
          this.updateAdminCache(userId, true);
          return true;
        }
      } catch (err) {
        console.log("[AuthService] Lỗi khi kiểm tra bảng users:", err);
      }
      
      // Cập nhật cache với kết quả không có quyền admin
      this.updateAdminCache(userId, false);
      return false;
    } catch (error) {
      console.error("[AuthService] Lỗi không xác định khi kiểm tra quyền admin:", error);
      return false;
    }
  }

  // Cập nhật cache admin check
  private updateAdminCache(userId: string, isAdmin: boolean): void {
    this.adminCheckCache[userId] = {
      userId,
      isAdmin,
      timestamp: Date.now()
    };
  }

  // Kiểm tra lỗi xác thực từ API response
  public isAuthError(error: any): boolean {
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

  // Xử lý lỗi xác thực
  public async handleAuthError(error: any): Promise<boolean> {
    if (this.isAuthError(error)) {
      console.log("[AuthService] Phát hiện lỗi xác thực, đang thử làm mới token...");
      const newToken = await tokenManager.refreshToken();
      return !!newToken;
    }
    return false;
  }
}

// Xuất instance singleton
export const authService = AuthService.getInstance();
