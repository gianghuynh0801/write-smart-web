
// Cấu hình các tính năng có thể bật/tắt trong ứng dụng
export const featureFlags = {
  // Tắt tính năng realtime để cải thiện hiệu suất
  enableRealtimeUpdates: false,
  
  // Cho phép auto refresh khi truy cập vào trang
  enableAutoRefresh: true,
  
  // Tăng thời gian cache lên 10 phút để giảm tải
  cacheValidTimeMs: 600000, // 10 phút
};
