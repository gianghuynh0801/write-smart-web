
import { supabase } from "@/integrations/supabase/client";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string | null> | null = null;
  private isRefreshing: boolean = false;
  private lastRefreshTime: number = 0;
  private refreshMinInterval: number = 5000; // Tăng lên 5 giây giữa các lần refresh
  private maxConcurrentRequests: number = 3;
  private activeRequests: number = 0;
  private requestQueue: Array<() => void> = [];
  
  // Private constructor để áp dụng Singleton pattern
  private constructor() {}
  
  // Phương thức tĩnh trả về instance duy nhất
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }
  
  // Quản lý hàng đợi request để hạn chế số lượng request đồng thời
  private async executeWithThrottle<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= this.maxConcurrentRequests) {
      // Đưa vào hàng đợi nếu đã đạt giới hạn
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push(() => {
          this.executeWithThrottle(fn)
            .then(resolve)
            .catch(reject);
        });
      });
    }
    
    this.activeRequests++;
    
    try {
      return await fn();
    } finally {
      this.activeRequests--;
      
      // Xử lý request tiếp theo trong hàng đợi nếu có
      if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
        const nextRequest = this.requestQueue.shift();
        nextRequest?.();
      }
    }
  }
  
  // Lấy token hiện tại hoặc làm mới nếu cần
  public async getToken(): Promise<string | null> {
    return this.executeWithThrottle(async () => {
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
    });
  }
  
  // Làm mới token dù token hiện tại còn hạn hay không, có cơ chế chống trùng lặp và throttling
  public async refreshToken(): Promise<string | null> {
    return this.executeWithThrottle(async () => {
      try {
        // Kiểm tra khoảng thời gian giữa các lần refresh để tránh gọi quá nhiều
        const now = Date.now();
        if (this.isRefreshing) {
          console.log("Đang có yêu cầu làm mới token, sử dụng lại promise hiện tại");
          if (this.refreshPromise) {
            return this.refreshPromise;
          }
          
          // Trường hợp isRefreshing=true nhưng refreshPromise=null (hiếm gặp)
          console.log("isRefreshing=true nhưng refreshPromise=null, reset trạng thái");
          this.isRefreshing = false;
          return this.refreshToken();
        }
        
        // Kiểm tra thời gian tối thiểu giữa các lần refresh
        if (now - this.lastRefreshTime < this.refreshMinInterval) {
          console.log(`Quá sớm để làm mới token, chờ ${this.refreshMinInterval - (now - this.lastRefreshTime)}ms`);
          if (this.token) {
            return this.token; // Sử dụng token hiện tại nếu có
          }
          
          // Nếu không có token hiện tại, đợi đủ thời gian rồi thử lại
          await new Promise(resolve => setTimeout(resolve, this.refreshMinInterval - (now - this.lastRefreshTime)));
          return this.refreshToken();
        }
        
        this.isRefreshing = true;
        console.log("Bắt đầu làm mới token...");
        
        // Tạo promise mới với timeout
        this.refreshPromise = new Promise(async (resolve, reject) => {
          try {
            // Thiết lập timeout để tránh chờ vô hạn
            const timeoutId = setTimeout(() => {
              console.error("Quá thời gian làm mới token");
              this.isRefreshing = false;
              this.refreshPromise = null;
              reject(new Error("Timeout khi làm mới token"));
            }, 8000); // Giảm xuống 8 giây để tránh blocking quá lâu
            
            // Lấy phiên hiện tại
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("Lỗi lấy phiên hiện tại:", sessionError);
              clearTimeout(timeoutId);
              this.clearToken();
              this.isRefreshing = false;
              this.refreshPromise = null;
              reject(sessionError);
              return;
            }
            
            if (!sessionData.session) {
              console.log("Không có phiên hiện tại");
              clearTimeout(timeoutId);
              this.clearToken();
              this.isRefreshing = false;
              this.refreshPromise = null;
              resolve(null);
              return;
            }
            
            // Làm mới token
            const { data, error } = await supabase.auth.refreshSession();
            
            clearTimeout(timeoutId);
            this.lastRefreshTime = Date.now();
            
            if (error) {
              console.error("Lỗi khi làm mới token:", error);
              this.clearToken();
              this.isRefreshing = false;
              this.refreshPromise = null;
              reject(error);
              return;
            }
            
            if (!data.session) {
              console.error("Không có phiên sau khi làm mới token");
              this.clearToken();
              this.isRefreshing = false;
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
            this.isRefreshing = false;
            const tokenToReturn = this.token;
            this.refreshPromise = null;
            resolve(tokenToReturn);
          } catch (error) {
            console.error("Lỗi không mong đợi khi làm mới token:", error);
            this.isRefreshing = false;
            this.refreshPromise = null;
            reject(error);
          }
        });
        
        return await this.refreshPromise;
      } catch (error) {
        console.error("Lỗi không mong đợi khi làm mới token:", error);
        this.clearToken();
        this.isRefreshing = false;
        this.refreshPromise = null;
        return null;
      }
    });
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
    this.isRefreshing = false;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
