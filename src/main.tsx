
// File này được vô hiệu hóa để tránh xung đột với điểm khởi chạy chính trong src/app/main.tsx
// Chúng ta đã cập nhật index.html để sử dụng src/app/main.tsx

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// File này không còn được sử dụng làm điểm khởi chạy
// ứng dụng bây giờ sử dụng src/app/main.tsx
// createRoot(document.getElementById("root")!).render(<App />);

console.warn('File src/main.tsx đã được vô hiệu hóa. Ứng dụng sử dụng src/app/main.tsx làm điểm khởi chạy.');
