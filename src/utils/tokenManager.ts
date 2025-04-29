
import { supabase } from "@/integrations/supabase/client";

class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private expiresAt: number = 0;
  
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
    // Nếu token đã hết hạn hoặc còn ít hơn 5 phút, làm mới
    const now = Math.floor(Date.now() / 1000);
    if (!this.token || now > this.expiresAt - 300) {
      return this.refreshToken();
    }
    return this.token;
  }
  
  // Làm mới token dù token hiện tại còn hạn hay không
  public async refreshToken(): Promise<string | null> {
    try {
      console.log("Đang làm mới token...");
      
      // Lấy phiên hiện tại
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Lỗi lấy phiên hiện tại:", sessionError);
        this.clearToken();
        return null;
      }
      
      if (!sessionData.session) {
        console.log("Không có phiên hiện tại");
        this.clearToken();
        return null;
      }
      
      // Làm mới token
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Lỗi khi làm mới token:", error);
        this.clearToken();
        return null;
      }
      
      if (!data.session) {
        console.error("Không có phiên sau khi làm mới token");
        this.clearToken();
        return null;
      }
      
      // Lưu token mới
      this.token = data.session.access_token;
      
      // Tính thời gian hết hạn
      const jwtPayload = JSON.parse(atob(this.token.split('.')[1]));
      this.expiresAt = jwtPayload.exp;
      
      console.log("Đã làm mới token thành công");
      return this.token;
    } catch (error) {
      console.error("Lỗi không mong đợi khi làm mới token:", error);
      this.clearToken();
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
      
      const payload = JSON.parse(atob(parts[1]));
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
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
