
// File này được giữ lại để đảm bảo tính tương thích ngược
// Chỉ chuyển tiếp xuất từ useLogin mới

import { useLogin as useLoginNew } from './auth/useLogin';

export function useLogin() {
  return useLoginNew();
}
