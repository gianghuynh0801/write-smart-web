
// File này được giữ lại để đảm bảo tính tương thích ngược
// Chỉ chuyển tiếp xuất từ AuthContext mới

import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthContext from './auth/AuthContext';

export { AuthProvider, useAuth };
export default AuthContext;
