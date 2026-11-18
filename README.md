# AMULES - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ TRANG SỨC & ĐÁ PHONG THỦY
> **Đồ án môn học:** Phát triển Web Kinh doanh Nâng cao  
> **Chủ đề:** Nền tảng E-Commerce Trang sức Đá quý Thiên nhiên & Bùa hộ mệnh Chiêm tinh học

---

## 📁 CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

Thư mục nộp bài chuẩn chỉnh gồm 2 phần độc lập:

```text
amules/
├── backend/                       # Web Server RESTful API (NodeJS + ExpressJS + MongoDB)
│   ├── config/
│   │   └── db.js                 # Cấu hình kết nối MongoDB native driver
│   ├── public/
│   │   └── images/               # Thư mục lưu trữ hình ảnh tải lên (Base64 file saving)
│   ├── index.js                  # Điểm khởi chạy Express Server, middleware & API routes
│   └── package.json              # Dependencies: express, mongodb, cors, express-session...
│
├── frontend/                      # Client Single Page Application (Angular 22)
│   ├── src/
│   │   ├── app/                  # Components, Modules, Services, Layouts
│   │   ├── proxy.conf.json       # Proxy chuyển tiếp /api -> http://localhost:3002
│   │   └── index.html            # SPA Entry point & Favicon
│   ├── public/                   # Static assets (Favicon, Logo, Mock images)
│   ├── angular.json              # Cấu hình Angular CLI & Build
│   └── package.json              # Angular dependencies
│
├── amules-database/              # Toàn bộ dữ liệu mẫu JSON ban đầu cho MongoDB
│   ├── products.json
│   ├── categories.json
│   ├── themes.json
│   └── ...
├── package.json                  # Root scripts điều khiển cả 2 phía
└── README.md                     # Tài liệu hướng dẫn cài đặt & vận hành
```

---

## 🧭 BẢNG DANH MỤC CÁC TRANG & ROUTING ĐÃ HOÀN THIỆN

| Chức năng | Đường dẫn URL | Mô tả & Công nghệ |
|---|---|---|
| **Trang chủ** | `/` | Banner trượt, Cam kết, Danh mục, Ngũ hành, Sản phẩm bán chạy, Cẩm nang |
| **Cửa hàng / Danh sách** | `/products` | Bộ lọc đa chiều (Danh mục, Ngũ hành, Đá quý, Giá tiền), Tìm kiếm, Sắp xếp |
| **Chi tiết sản phẩm** | `/products/:slug` | SEO Slug, Gallery ảnh, Chọn kích cỡ, Thêm vào giỏ, Mua ngay, Đánh giá |
| **Giỏ hàng** | `/cart` | Quản lý số lượng, Tạm tính, Áp mã voucher, Thanh tiến độ Freeship |
| **Thanh toán & Đặt hàng** | `/checkout` | Form địa chỉ, Chọn hình thức giao hàng, Thanh toán COD & Chuyển khoản QR |
| **Đặt hàng thành công** | `/order-success/:code` | Thông báo mã đơn AMU-XXXX, ngày giao dự kiến, 3 bước xử lý đơn hàng |
| **Mystic Match™** | `/mystic-match` | Trắc nghiệm chiêm tinh: Tính cung hoàng đạo & Ngũ hành Can Chi, Gợi ý đá |
| **Bộ sưu tập độc bản** | `/collections` | Mystical Vintage, Moon & Stars, Nàng Thơ và danh sách tạo tác theo chủ đề |
| **Đăng nhập** | `/login` | Đăng nhập tài khoản, ghi nhớ cookie, đăng nhập nhanh qua Google |
| **Đăng ký** | `/register` | Reactive Form kiểm tra độ mạnh mật khẩu và trùng khớp mật khẩu |
| **Hồ sơ cá nhân** | `/account/profile` | Thông tin cá nhân, ngày sinh, bản mệnh ngũ hành, cỡ tay |
| **Sổ địa chỉ** | `/account/addresses` | Quản lý danh sách địa chỉ nhận hàng, đặt địa chỉ mặc định |
| **Lịch sử đơn hàng** | `/account/orders` | Danh sách đơn hàng thời gian thực, tiến trình giao hàng, đánh giá |
| **Sản phẩm yêu thích** | `/account/wishlist` | Bộ sưu tập bảo vật yêu thích đã lưu |
| **Điểm & Ưu đãi** | `/account/rewards` | Tích lũy điểm năng lượng, kho mã giảm giá |
| **Bảo mật tài khoản** | `/account/security` | Đổi mật khẩu, xác thực hai lớp (2FA) |

---

## 🛠️ YÊU CẦU HỆ THỐNG
1. **Node.js**: v18 trở lên (Khuyến nghị LTS hoặc v20+)
2. **MongoDB Community Server**: Đang chạy tại cổng mặc định `mongodb://127.0.0.1:27017` với database `amules`
3. **Angular CLI**: `@angular/cli` (Toàn cục hoặc qua `npx`)

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### 1. Khởi chạy Backend (Port 3002)
Mở một cửa sổ Terminal tại thư mục `backend`:
```bash
cd backend
npm install
npm start
```
*(Server chạy tại `http://localhost:3002` và tự động kết nối vào MongoDB database `amules`).*

### 2. Khởi chạy Frontend (Port 4200)
Mở một cửa sổ Terminal thứ hai tại thư mục `frontend`:
```bash
cd frontend
npm start
```
*(Website tự động mở tại `http://localhost:4200`, mọi request `/api/*` sẽ được tự động proxy sang backend `3002`).*

---

## 🌟 CÁC TÍNH NĂNG NỔI BẬT THEO CHUẨN MÔN HỌC
- **Angular Core & Signals:** Quản lý state phản ứng tức thì với `signal()`, `set()`, `update()`.
- **New Control Flow:** Cú pháp compile-time hiện đại `@if`, `@else`, `@for (... track ...)`, `@empty`.
- **RESTful API CRUD:** Đầy đủ các phương thức HTTP GET, POST, PUT, DELETE chuẩn RESTful.
- **Session & Cookie:** Quản lý giỏ hàng tạm bằng `express-session` trên RAM server và lưu thông tin đăng nhập bằng Cookie.
- **Tối ưu SEO:** Tạo đường dẫn sản phẩm thân thiện với SEO qua `SlugHelper` (`ten-san-pham-p{id}`).
