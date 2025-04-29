
// Cấu hình các tính năng có thể bật/tắt trong ứng dụng
export const featureFlags = {
  // Tắt tính năng realtime để cải thiện hiệu suất
  enableRealtimeUpdates: false,
  
  // Tắt tính năng auto refresh để giảm số lần gọi API
  enableAutoRefresh: false,
  
  // Tăng thời gian cache lên 5 phút để giảm tải
  cacheValidTimeMs: 300000, // 5 phút
};

