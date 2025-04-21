
# WriteSmart - Ứng dụng tạo nội dung SEO với AI

WriteSmart là ứng dụng web cho phép người dùng tạo nội dung chuẩn SEO tự động bằng AI và đăng lên nhiều nền tảng khác nhau như WordPress, Facebook, TikTok và các mạng xã hội khác.

## Tính năng chính

- **Tạo nội dung AI**: Tạo bài viết chuẩn SEO tự động với AI
- **Hệ thống tín dụng**: Mua và sử dụng tín dụng để tạo nội dung
- **Quản lý gói đăng ký**: Các gói dịch vụ theo nhu cầu người dùng
- **Kết nối đa nền tảng**: WordPress, Facebook, Twitter, TikTok
- **Hỗ trợ đa ngôn ngữ**: Tiếng Việt và Tiếng Anh
- **Quản trị viên**: Bảng điều khiển quản trị cho người quản lý

## Cài đặt và Chạy

### Yêu cầu

- Node.js 16+ và npm
- PostgreSQL
- Tài khoản Supabase (hoặc Auth.js)

### Môi trường phát triển

1. Clone repository:
```bash
git clone https://github.com/your-username/writesmart.git
cd writesmart
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file `.env`:
```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/writesmart

# Authentication
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# n8n Webhook
VITE_N8N_WEBHOOK_URL=your-n8n-webhook-url

# Payment (Stripe, etc.)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

5. Chạy ứng dụng trong môi trường phát triển:
```bash
npm run dev
```

### Xây dựng và triển khai

1. Xây dựng ứng dụng:
```bash
npm run build
```

2. Triển khai với PM2:
```bash
pm2 start ecosystem.config.js
```

## Cấu trúc thư mục

```
writesmart/
├── public/               # Tài nguyên tĩnh
├── src/
│   ├── components/       # React components
│   │   ├── common/       # Components dùng chung
│   │   ├── dashboard/    # Components cho dashboard
│   │   ├── home/         # Components cho trang chủ
│   │   └── ui/           # UI components (shadcn)
│   ├── hooks/            # React hooks
│   ├── lib/              # Thư viện và utilities
│   ├── pages/            # Các trang
│   │   ├── admin/        # Trang quản trị
│   │   └── dashboard/    # Trang dashboard người dùng
│   ├── utils/            # Các tiện ích
│   └── App.tsx           # Component gốc
├── .env.example          # Mẫu file biến môi trường
├── ecosystem.config.js   # Cấu hình PM2
├── package.json
├── prisma/               # Schema và migrations Prisma
├── tailwind.config.ts    # Cấu hình Tailwind CSS
└── tsconfig.json         # Cấu hình TypeScript
```

## Webhook n8n

Ứng dụng sử dụng n8n để kết nối với API của các mô hình AI và xử lý việc tạo nội dung. Để thiết lập webhook n8n:

1. Cài đặt n8n:
```bash
npm install -g n8n
```

2. Chạy n8n:
```bash
n8n start
```

3. Tạo workflow trong n8n:
   - Sử dụng webhook node để nhận requests
   - Kết nối với API của mô hình AI (như OpenAI)
   - Xử lý và format nội dung
   - Trả về kết quả

4. Lưu URL webhook và cấu hình trong file `.env` của ứng dụng

## Tài khoản quản trị mặc định

Khi ứng dụng được khởi tạo lần đầu, một tài khoản quản trị mặc định sẽ được tạo:

- **Username**: admin
- **Password**: admin@1238

*Lưu ý: Đổi mật khẩu này ngay sau khi đăng nhập lần đầu.*

## Phát triển

### Thêm ngôn ngữ mới

Để thêm một ngôn ngữ mới, cập nhật file `src/utils/i18n.ts` với các bản dịch mới.

### Thêm phương thức thanh toán

Mặc định, ứng dụng hỗ trợ thanh toán qua Stripe. Để thêm phương thức thanh toán mới:
1. Tạo adapter trong `src/utils/paymentAdapters/`
2. Cập nhật các trang thanh toán để sử dụng adapter mới

## License

MIT License
