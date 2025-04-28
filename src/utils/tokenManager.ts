
import { setItem, getItem, removeItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";
import { supabase } from "@/integrations/supabase/client";

// Đối tượng chứa các thông tin về token hiện tại
interface TokenInfo {
  token: string;
  expiresAt: number; // Unix timestamp
}

// Class quản lý token
class TokenManager {
  private static instance: TokenManager;
  private refreshInProgress: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;
  private tokenCache: Record<string, TokenInfo> = {};
  
  private constructor() {}

  // Singleton pattern
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Lấy token từ localStorage hoặc cache
  public async getToken(): Promise<string | null> {
    try {
      // Kiểm tra cache trước
      const cachedToken = this.tokenCache[LOCAL_STORAGE_KEYS.SESSION_TOKEN];
      if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
      }

      // Nếu không có trong cache hoặc đã hết hạn, kiểm tra localStorage
      const storedToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
      
      if (!storedToken) {
        console.log("[TokenManager] Không tìm thấy token trong storage");
        return await this.refreshToken();
      }

      // Nếu có token, cập nhật vào cache
      this.updateTokenCache(storedToken);
      return storedToken;
    } catch (error) {
      console.error("[TokenManager] Lỗi khi lấy token:", error);
      return null;
    }
  }

  // Lưu token vào localStorage và cache
  public saveToken(token: string): void {
    try {
      setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, token);
      this.updateTokenCache(token);
      console.log("[TokenManager] Đã lưu token mới");
    } catch (error) {
      console.error("[TokenManager] Lỗi khi lưu token:", error);
    }
  }

  // Xóa token khỏi localStorage và cache
  public clearToken(): void {
    try {
      removeItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN);
      delete this.tokenCache[LOCAL_STORAGE_KEYS.SESSION_TOKEN];
      console.log("[TokenManager] Đã xóa token");
    } catch (error) {
      console.error("[TokenManager] Lỗi khi xóa token:", error);
    }
  }

  // Làm mới token nếu cần
  public async refreshToken(): Promise<string | null> {
    // Nếu đang refresh, trả về promise hiện tại
    if (this.refreshInProgress && this.refreshPromise) {
      console.log("[TokenManager] Refresh đang được thực hiện, sử dụng promise hiện tại");
      return this.refreshPromise;
    }

    try {
      this.refreshInProgress = true;
      this.refreshPromise = this.doRefreshToken();
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshInProgress = false;
      this.refreshPromise = null;
    }
  }

  // Kiểm tra token có hợp lệ hay không
  public async validateToken(token: string): Promise<boolean> {
    try {
      // Kiểm tra token bằng cách gọi API getUser
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        console.log("[TokenManager] Token không hợp lệ:", error?.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("[TokenManager] Lỗi khi xác thực token:", error);
      return false;
    }
  }

  // Thực hiện refresh token
  private async doRefreshToken(): Promise<string | null> {
    try {
      console.log("[TokenManager] Đang làm mới token...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error("[TokenManager] Lỗi khi làm mới session:", error);
        this.clearToken();
        return null;
      }
      
      console.log("[TokenManager] Đã làm mới token thành công");
      const newToken = data.session.access_token;
      this.saveToken(newToken);
      return newToken;
    } catch (error) {
      console.error("[TokenManager] Lỗi không mong đợi khi làm mới token:", error);
      this.clearToken();
      return null;
    }
  }

  // Cập nhật cache token với thời gian hết hạn (+10 phút để dự phòng)
  private updateTokenCache(token: string): void {
    // Tạo thời gian hết hạn là 50 phút (token JWT thường có thời hạn 1 giờ)
    // Chúng ta giảm 10 phút để đảm bảo token được làm mới trước khi thực sự hết hạn
    const expiresAt = Date.now() + 50 * 60 * 1000;
    
    this.tokenCache[LOCAL_STORAGE_KEYS.SESSION_TOKEN] = {
      token,
      expiresAt
    };
  }
}

// Xuất instance singleton
export const tokenManager = TokenManager.getInstance();
