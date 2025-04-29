
import { supabase } from "@/integrations/supabase/client";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string | null> | null = null;
  
  // Private constructor để áp dụng Singleton pattern
  private constructor() {}
  
  // Phương thức tĩnh trả về instance duy nhất
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }
  
  // Lấy token hiện tại hoặc làm mới nếu cần
  public async getToken(): Promise<string | null> {
    try {
      // Nếu token đã hết hạn hoặc còn ít hơn 5 phút, làm mới
      const now = Math.floor(Date.now() / 1000);
      if (!this.token || now > this.expiresAt - 300) {
        return this.refreshToken();
      }
      return this.token;
    } catch (error) {
      console.error("Lỗi khi lấy token:", error);
      return null;
    }
  }
  
  // Làm mới token dù token hiện tại còn hạn hay không, có cơ chế chống trùng lặp
  public async refreshToken(): Promise<string | null> {
    try {
      // Nếu đã có một promise đang chờ, sử dụng lại để tránh nhiều yêu cầu cùng lúc
      if (this.refreshPromise) {
        console.log("Đang có yêu cầu làm mới token, sử dụng lại promise hiện tại");
        return this.refreshPromise;
      }
      
      console.log("Bắt đầu làm mới token...");
      
      // Tạo promise mới với timeout
      this.refreshPromise = new Promise(async (resolve, reject) => {
        try {
          // Thiết lập timeout để tránh chờ vô hạn
          const timeoutId = setTimeout(() => {
            console.error("Quá thời gian làm mới token");
            this.refreshPromise = null;
            reject(new Error("Timeout khi làm mới token"));
          }, 10000);
          
          // Lấy phiên hiện tại
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Lỗi lấy phiên hiện tại:", sessionError);
            clearTimeout(timeoutId);
            this.clearToken();
            this.refreshPromise = null;
            reject(sessionError);
            return;
          }
          
          if (!sessionData.session) {
            console.log("Không có phiên hiện tại");
            clearTimeout(timeoutId);
            this.clearToken();
            this.refreshPromise = null;
            resolve(null);
            return;
          }
          
          // Làm mới token
          const { data, error } = await supabase.auth.refreshSession();
          
          clearTimeout(timeoutId);
          
          if (error) {
            console.error("Lỗi khi làm mới token:", error);
            this.clearToken();
            this.refreshPromise = null;
            reject(error);
            return;
          }
          
          if (!data.session) {
            console.error("Không có phiên sau khi làm mới token");
            this.clearToken();
            this.refreshPromise = null;
            resolve(null);
            return;
          }
          
          // Lưu token mới
          this.token = data.session.access_token;
          setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, this.token);
          
          // Tính thời gian hết hạn
          try {
            const jwtPayload = JSON.parse(atob(this.token.split('.')[1]));
            this.expiresAt = jwtPayload.exp;
          } catch (e) {
            console.error("Lỗi khi parse JWT payload:", e);
            this.expiresAt = Math.floor(Date.now() / 1000) + 3600; // Giả sử hết hạn sau 1 giờ
          }
          
          console.log("Đã làm mới token thành công");
          this.refreshPromise = null;
          resolve(this.token);
        } catch (error) {
          console.error("Lỗi không mong đợi khi làm mới token:", error);
          this.clearToken();
          this.refreshPromise = null;
          reject(error);
        }
      });
      
      return await this.refreshPromise;
    } catch (error) {
      console.error("Lỗi không mong đợi khi làm mới token:", error);
      this.clearToken();
      this.refreshPromise = null;
      return null;
    }
  }
  
  // Kiểm tra token có hợp lệ không
  public async validateToken(token: string): Promise<boolean> {
    if (!token) return false;
    
    try {
      // Parse JWT payload
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      let payload;
      try {
        payload = JSON.parse(atob(parts[1]));
      } catch (e) {
        console.error("Lỗi khi parse JWT payload:", e);
        return false;
      }
      
      const exp = payload.exp;
      
      if (!exp) return false;
      
      // Kiểm tra thời gian hết hạn
      const now = Math.floor(Date.now() / 1000);
      if (now >= exp) return false;
      
      return true;
    } catch (error) {
      console.error("Lỗi khi xác thực token:", error);
      return false;
    }
  }
  
  // Xóa token
  public clearToken(): void {
    this.token = null;
    this.expiresAt = 0;
    this.refreshPromise = null;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
